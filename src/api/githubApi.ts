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

    console.log('token', token)

    return token;
  }

  async getAccessToken() {
    const installations = await this.handleRequest<{ app_slug: string }[]>("app/installations", {}, {
      method: "GET",
    });

    const installation = installations.find(
      (installation) => installation.app_slug === this.GITHUB_APP_NAME
    );

    console.log('installation', installation)
    return "";
  }

  async getMergeablePr() {
    const params = {
      state: "open",
      labels: "Mergeable",
      pulls: "true",
    }

    return await this.handleRequest("issues", params, {
      method: "GET",
    });
  }

  async handleRequest<T>(path: PathList, params: { [key: string]: string } | undefined, options: RequestInit): Promise<T> {
    const queryParams = params ? new URLSearchParams(params) : undefined
    console.log('queryParams', queryParams)

    const accessToken = this.getToken();
    const url = `https://api.github.com/repos/${this.GITHUB_USERNAME}/${this.GITHUB_REPO}/${path}`;

    const result = await fetch(`${url}${queryParams?.toString() || ''}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    console.log('result', result)
    return await result.json() as T;
  };
}