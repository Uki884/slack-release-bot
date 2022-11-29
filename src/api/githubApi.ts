
import { githubApiRequest } from "../lib/axios";

export class GithubApi {
  constructor(private readonly api = githubApiRequest) {}

  async getMergeablePr() {
    return await this.api.get("/issues", {
      params: { state: "open", labels: "Mergeable", pulls: "true" },
    });
  }

  async runRepositoryDispatchEvent(payload: { event_type: string }) {
    return await this.api.post("/dispatches", payload);
  }

  async updateRelease(releaseId: string, payload: { draft: boolean }) {
    return await this.api.patch(`/releases/${releaseId}`, payload);
  }
}

export const filterPullRequests = (data: any) => {
  return data.map((item) => {
    return {
      id: item.id,
      number: item.number,
      user: item.user,
      title: item.title,
      url: item.html_url,
    };
  });
};