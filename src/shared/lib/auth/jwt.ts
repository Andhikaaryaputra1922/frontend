import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "lms_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing JWT secret. Set JWT_SECRET or NEXTAUTH_SECRET in .env");
  }
  return secret;
}

const encoder = new TextEncoder();

export type AuthPayload = {
  uid: string;
  role: string;
};

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export async function signUserJwt(payload: AuthPayload) {
  const secret = getJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(secret));
}

export async function verifyUserJwt(token: string): Promise<AuthPayload> {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify<AuthPayload>(token, encoder.encode(secret), {
    algorithms: ["HS256"],
  });

  if (!payload?.uid || !payload?.role) {
    throw new Error("Invalid JWT payload");
  }

  return { uid: payload.uid, role: payload.role };
}

