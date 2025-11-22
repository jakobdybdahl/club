export const vpc = ["dev", "production"].includes($app.stage)
  ? new sst.aws.Vpc("VPC", {
      bastion: true,
      nat: "ec2",
    })
  : sst.aws.Vpc.get("VPC", "vpc-0aaf7872e28ea66b0");
