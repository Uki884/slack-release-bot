import axiosBase from "axios";

export const githubApiRequest = axiosBase.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
  responseType: "json",
});