import { type ApiAuth } from "@/features/auth/api/auth";
import { UserRole, type UserRole as UserRoleValue } from "@/features/auth/models/UserRole";
import { AxiosClient } from "@/infrastructure/browser";
import z from "zod";

const AuthMeResponse = z.object({
  username: z.string(),
  role: UserRole.nullish(),
});

const AuthLoginResponse = z.object({
  username: z.string(),
  message: z.string(),
});

class ApiAuthOnline extends AxiosClient implements ApiAuth {
  constructor() {
    super("auth");
  }

  async login(username: string, password: string): Promise<{ username: string; message: string }> {
    return await this.httpPost(AuthLoginResponse)("login", { username, password });
  }

  async logout(): Promise<void> {
    await this.httpPost(z.unknown())("logout");
  }

  async me(): Promise<{ username: string; role: UserRoleValue | null }> {
    const response = await this.httpGet(AuthMeResponse)("me");
    return {
      username: response.username,
      role: response.role ?? null,
    };
  }
}

export const Auth = new ApiAuthOnline();
