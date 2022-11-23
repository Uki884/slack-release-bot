import axiosBase from "axios";

export const githubApiRequest = axiosBase.create({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  },
  baseURL: `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}`,
  responseType: "json",
});