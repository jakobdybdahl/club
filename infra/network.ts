export const vpc = new sst.aws.Vpc("VPC", { nat: "ec2", bastion: true });
