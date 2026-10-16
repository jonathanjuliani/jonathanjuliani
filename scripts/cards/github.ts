export type ContributionDay = {
  date: string;
  contributionCount: number;
};

export type LanguageEdge = {
  size: number;
  node: { name: string; color: string | null };
};

export type CardsResponse = {
  user: {
    contributionsCollection: {
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      restrictedContributionsCount: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: ContributionDay[] }[];
      };
    };
    repositories: {
      nodes: {
        languages: {
          edges: LanguageEdge[];
        };
      }[];
    };
  } | null;
};

const QUERY = `query Cards($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalPullRequestContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

export async function fetchCards(
  login: string,
  token: string,
  now: Date = new Date(),
): Promise<CardsResponse> {
  const to = now.toISOString();
  const fromDate = new Date(now.getTime());
  fromDate.setUTCDate(fromDate.getUTCDate() - 365);
  const from = fromDate.toISOString();

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { login, from, to },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL HTTP ${res.status}`);
  }

  const body = (await res.json()) as {
    data?: CardsResponse;
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${body.errors.map((e) => e.message).join("; ")}`);
  }
  if (!body.data?.user) {
    throw new Error("GitHub GraphQL returned null user");
  }

  return body.data;
}
