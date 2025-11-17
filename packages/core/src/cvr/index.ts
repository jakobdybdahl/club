import axios from "axios";
import { z } from "zod";
import { zod } from "../util/zod";

export * as CVR from "./index";

const addressSchema = z.object({
  landekode: z.string(),
  fritekst: z.string().nullable(),
  vejkode: z.number(),
  kommune: z.object({
    kommuneKode: z.number(),
    kommuneNavn: z.string(),
  }),
  husnummerFra: z.number().nullable(),
  adresseId: z.string().nullable(),
  sidstValideret: z.string().nullable(),
  husnummerTil: z.number().nullable(),
  bogstavFra: z.string().nullable(),
  bogstavTil: z.string().nullable(),
  etage: z.string().nullable(),
  sidedoer: z.string().nullable(),
  conavn: z.string().nullable(),
  postboks: z.string().nullable(),
  vejnavn: z.string(),
  bynavn: z.string().nullable(),
  postnummer: z.number(),
  postdistrikt: z.string(),
});

const schema = z.object({
  hits: z.object({
    total: z.number(),
    max_score: z.number().nullable(),
    hits: z.array(
      z.object({
        _score: z.number(),
        _source: z.object({
          Vrvirksomhed: z.object({
            cvrNummer: z.number(),
            navne: z.array(
              z.object({
                navn: z.string(),
                periode: z.object({
                  gyldigFra: z.string().nullable(),
                  gyldigTil: z.string().nullable(),
                }),
              })
            ),
            binavne: z.array(
              z.object({
                navn: z.string(),
                periode: z.object({
                  gyldigFra: z.string().nullable(),
                  gyldigTil: z.string().nullable(),
                }),
              })
            ),
            virksomhedMetadata: z.object({
              nyesteNavn: z.object({
                navn: z.string(),
                periode: z.object({
                  gyldigFra: z.string().nullable(),
                  gyldigTil: z.string().nullable(),
                }),
              }),
              nyesteBinavne: z.array(z.string()),
              nyesteBeliggenhedsadresse: addressSchema,
              nyesteVirksomhedsform: z.object({
                virksomhedsformkode: z.number(),
                kortBeskrivelse: z.string(),
                langBeskrivelse: z.string(),
                periode: z.object({
                  gyldigFra: z.string().nullable(),
                  gyldigTil: z.string().nullable(),
                }),
              }),
              nyesteHovedbranche: z.object({
                branchekode: z.string(),
                branchetekst: z.string(),
                periode: z.object({
                  gyldigFra: z.string().nullable(),
                  gyldigTil: z.string().nullable(),
                }),
              }),
              nyesteErstMaanedsbeskaeftigelse: z
                .object({
                  intervalKodeAntalAnsatte: z.string(),
                  aar: z.number(),
                  maaned: z.number(),
                  intervalKodeAntalAarsvaerk: z.string(),
                  antalAarsvaerk: z.number(),
                  antalAnsatte: z.number(),
                })
                .nullable(),
            }),
          }),
        }),
      })
    ),
  }),
});

type Hit = {
  _score: number;
  cvrNumber: number;
  name: string;
  aliases: string[];
  type: string;
  industry: string;
  industryCode: string;
  employment: {
    count: number;
    fullTime: number;
    year: number;
    month: number;
  } | null;
  addressLine: string;
  address: {
    street: string;
    countryCode: string;
    municipality: string;
    city: string | null;
    zipCode: number;
    zipDistrict: string;
    houseNumberFrom: number | null;
    floor: string | null;
    side: string | null;
    coname: string | null;
    houseNumberTo: number | null;
    letterFrom: string | null;
    letterTo: string | null;
  };
};

export type SearchResult = {
  total: number;
  maxScore: number | null;
  hits: Hit[];
};

const client = axios.create({
  baseURL: "http://distribution.virk.dk/cvr-permanent/virksomhed",
  validateStatus: () => true,
  // headers: {
  //   Authorization: `Basic ${Buffer.from(
  //     `Club_CVR_I_SKYEN:${Resource.CVRPassword.value}`
  //   ).toString("base64")}`,
  // },
});

export const search = zod(
  z.object({ query: z.string().trim().nonempty() }),
  async (input): Promise<SearchResult> => {
    const response = await client.post("/_search", {
      min_score: 5,
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    match: {
                      "Vrvirksomhed.virksomhedMetadata.sammensatStatus": {
                        query: "normal",
                      },
                    },
                  },
                  {
                    match: {
                      "Vrvirksomhed.virksomhedMetadata.sammensatStatus": {
                        query: "aktiv",
                      },
                    },
                  },
                ],
              },
            },
          ],
          should: [
            {
              multi_match: {
                query: input.query,
                operator: "and",
                fuzziness: "AUTO",
                fields: [
                  "Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn",
                  "Vrvirksomhed.virksomhedMetadata.nyesteBinavne",
                ],
              },
            },
            {
              match: {
                "Vrvirksomhed.cvrNummer": {
                  query: input.query,
                },
              },
            },
            {
              match_phrase_prefix: {
                "Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn": {
                  query: input.query,
                },
              },
            },
            {
              match_phrase_prefix: {
                "Vrvirksomhed.virksomhedMetadata.nyesteBinavne": {
                  query: input.query,
                },
              },
            },
          ],
        },
      },
    });

    if (response.status !== 200) {
      throw new CVRSearchError(response.status);
    }

    const { hits } = schema.parse(response.data);

    return {
      total: hits.total,
      maxScore: hits.max_score,
      hits: hits.hits.map(({ _score, _source: hit }) => ({
        _score,
        cvrNumber: hit.Vrvirksomhed.cvrNummer,
        name: hit.Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn,
        aliases: hit.Vrvirksomhed.virksomhedMetadata.nyesteBinavne,
        industry:
          hit.Vrvirksomhed.virksomhedMetadata.nyesteHovedbranche.branchetekst,
        industryCode:
          hit.Vrvirksomhed.virksomhedMetadata.nyesteHovedbranche.branchekode,
        type: hit.Vrvirksomhed.virksomhedMetadata.nyesteVirksomhedsform
          .langBeskrivelse,
        employment: hit.Vrvirksomhed.virksomhedMetadata
          .nyesteErstMaanedsbeskaeftigelse
          ? {
              count:
                hit.Vrvirksomhed.virksomhedMetadata
                  .nyesteErstMaanedsbeskaeftigelse.antalAnsatte,
              fullTime:
                hit.Vrvirksomhed.virksomhedMetadata
                  .nyesteErstMaanedsbeskaeftigelse.antalAarsvaerk,
              month:
                hit.Vrvirksomhed.virksomhedMetadata
                  .nyesteErstMaanedsbeskaeftigelse.maaned,
              year: hit.Vrvirksomhed.virksomhedMetadata
                .nyesteErstMaanedsbeskaeftigelse.aar,
            }
          : null,
        addressLine: prettyAddress(
          hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
        ),
        address: {
          countryCode:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .landekode,
          street:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .vejnavn,
          zipCode:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .postnummer,
          zipDistrict:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .postdistrikt,
          city: hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
            .bynavn,
          floor:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse.etage,
          side: hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
            .sidedoer,
          coname:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .conavn,
          houseNumberFrom:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .husnummerFra,
          houseNumberTo:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .husnummerTil,
          letterFrom:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .bogstavFra,
          letterTo:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .bogstavTil,
          municipality:
            hit.Vrvirksomhed.virksomhedMetadata.nyesteBeliggenhedsadresse
              .kommune.kommuneNavn,
        },
      })),
    };
  }
);

class CVRSearchError extends Error {
  public constructor(public status: number) {
    super(`Unsuccessful CVR Search response. Status code: ${status}`);
  }
}

function prettyAddress(address: z.infer<typeof addressSchema>): string {
  let result = `${address.vejnavn}`;

  if (address.husnummerFra) {
    result += ` ${address.husnummerFra}${address.bogstavFra ?? ""}`;
  }

  if (address.husnummerTil) {
    result += `-${address.husnummerTil}${address.bogstavTil ?? ""}`;
  }

  result += ", ";

  if (address.etage) {
    result += `${address.etage}.`;
    if (address.sidedoer) {
      result += ` ${address.sidedoer}`;
    }
    result += ", ";
  }

  if (address.bynavn) {
    result += `${address.bynavn}, `;
  }

  result += `${address.postnummer} ${address.postdistrikt}`;

  return result;
}
