import jwt from '@tsndr/cloudflare-worker-jwt'

const PATH_LIST = {
  ISSUES: "issues",
  PULLS: "pulls",
  INSTALLATIONS: "app/installations",
} as const;

type PathList = typeof PATH_LIST[keyof typeof PATH_LIST];

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

    return await this.repoRequest("issues", params, {
      method: "GET",
    });
  }

  get baseUrl() {
    return `https://api.github.com`
  }

  get reposUrl() {
    return `${this.baseUrl}/repos/${this.GITHUB_USERNAME}/${this.GITHUB_REPO}`
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
    const installations = await this.apiRequest<{ app_slug: string, id: number }[]>("app/installations", {}, {
      method: "GET",
    });

    const installation = installations.find(
      (installation) => installation.app_slug === this.GITHUB_APP_NAME
    );

    if (!installation) {
      return "";
    }

    const response = await this.apiRequest(
      `app/installations/${installation.id}/access_tokens`,
      {},
      {
        method: "POST",
      }
    );
    const result = await response as { token: string };
    return result.token;
  }

  async repoRequest<T>(path: PathList, params: { [key: string]: string } | undefined, options: RequestInit): Promise<T> {
    const accessToken = await this.getAccessToken();
    return await this.handleRequest(`${this.reposUrl}/${path}`, params, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
  }

  async apiRequest<T>(path: string, params: { [key: string]: string } | undefined, options: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/${path}`
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