import jwt from '@tsndr/cloudflare-worker-jwt'
import { PullRequest } from './types';

const PATH_LIST =  {
  ISSUES: () => "issues" as const,
  PULLS: () => "pulls" as const,
  INSTALLATIONS: () => "app/installations" as const,
  ACCESS_TOKENS: (installationId: number) => `app/installations/${installationId}/access_tokens` as const,
} as const;

type PathList = {
  ISSUES: ReturnType<typeof PATH_LIST.ISSUES>;
  PULLS: ReturnType<typeof PATH_LIST.PULLS>;
  INSTALLATIONS: ReturnType<typeof PATH_LIST.INSTALLATIONS>;
  ACCESS_TOKENS: ReturnType<typeof PATH_LIST.ACCESS_TOKENS>;
};

type PathListKeys = keyof PathList;


type Env = {
  GITHUB_PRIVATE_KEY: string;
  GITHUB_APP_ID: string;
  GITHUB_APP_NAME: string;
  GITHUB_USERNAME: string;
  GITHUB_REPO: string;
}

export class GithubApi {
  private constructor(private GITHUB_PRIVATE_KEY: string, private GITHUB_APP_ID: string, private GITHUB_APP_NAME: string, private GITHUB_USERNAME: string, private GITHUB_REPO: string) {}

  static new(props: Env): GithubApi {
    return new GithubApi(
      props.GITHUB_PRIVATE_KEY,
      props.GITHUB_APP_ID,
      props.GITHUB_APP_NAME,
      props.GITHUB_USERNAME,
      props.GITHUB_REPO
    );
  }

  async getMergeablePr() {
    const params = {
      state: "open",
      labels: "Mergeable",
      pulls: "true",
    }

    return await this.repoApiRequest<PullRequest[]>(PATH_LIST.ISSUES(), params, {
      method: "GET",
    });
  }

  async getToken() {
    const cert = this.GITHUB_PRIVATE_KEY as string;
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 60,
      iat: Math.floor(Date.now() / 1000) - 10,
      iss: this.GITHUB_APP_ID as string,
    };
    const secret = cert.replace(/\\n/g, "\n");
    const token = await jwt.sign(payload, secret, {
      algorithm: "RS256",
    });

    return token;
  }

  async getAccessToken() {
    const installations = await this.apiRequest<{ app_slug: string, id: number }[]>(PATH_LIST.INSTALLATIONS(), {}, {
      method: "GET",
    });

    const installation = installations.find(
      (installation) => installation.app_slug === this.GITHUB_APP_NAME
    );

    if (!installation) {
      return "";
    }

    const response = await this.apiRequest(
      PATH_LIST.ACCESS_TOKENS(installation.id),
      {},
      {
        method: "POST",
      }
    );
    const result = await response as { token: string };
    return result.token;
  }

  async repoApiRequest<T>(path: PathList[PathListKeys], params: { [key: string]: string } | undefined, options: RequestInit): Promise<T> {
    const accessToken = await this.getAccessToken();
    return await this.handleRequest(`https://api.github.com/repos/${this.GITHUB_USERNAME}/${this.GITHUB_REPO}/${path}`, params, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
  }

  async apiRequest<T>(path: PathList[PathListKeys], params: { [key: string]: string } | undefined, options: RequestInit): Promise<T> {
    const url = `https://api.github.com/${path}`
    const accessToken = await this.getToken();
    return await this.handleRequest(url, params, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    }
    );
  }

  async handleRequest<T>(url: string, params: { [key: string]: string } | undefined, options: RequestInit): Promise<T> {
    const queryParams = params ? new URLSearchParams(params) : undefined

    const response = await fetch(`${url}?${queryParams?.toString() || ''}`, {
      ...options,
      headers: {
        ...options.headers,
        'User-Agent': 'request',
        "Content-Type": "application/json",
        Accept: "application/vnd.github",
      }
    });
    const result = await response.json();
    return await result as T
  };
}