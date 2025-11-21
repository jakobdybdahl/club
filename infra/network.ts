export const vpc = new sst.aws.Vpc("VPC", { nat: "ec2", bastion: true });

// export const vpc = ["dev", "production"].includes($app.stage)
//   ? new sst.aws.Vpc("VPC", {
//       bastion: true,
//       nat: "ec2",
//     })
//   : sst.aws.Vpc.get("VPC", "vpc-0d9c344de9a454e83");
