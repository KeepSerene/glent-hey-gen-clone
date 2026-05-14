"use client";

import {
  useAuth,
  useSendVerificationEmail,
  useSignInEmail,
} from "@better-auth-ui/react";
import { Eye, EyeOff } from "lucide-react";
import { type SyntheticEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";

export type SignInProps = {
  className?: string;
};

export function SignIn({ className }: SignInProps) {
  const {
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    redirectTo,
    viewPaths,
    navigate,
    Link,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Needed to offer a "Resend verification email" action on EMAIL_NOT_VERIFIED errors
  const { mutate: sendVerificationEmail } = useSendVerificationEmail({
    onSuccess: () => toast.success(localization.auth.verificationEmailSent),
  });

  const { mutate: signInEmail, isPending } = useSignInEmail({
    onError: (error, { email }) => {
      setPassword("");

      const errError = error.error as
        | { code?: string; message?: string }
        | undefined;

      if (errError?.code === "EMAIL_NOT_VERIFIED") {
        toast.error(errError?.message ?? error.message, {
          action: {
            label: localization.auth.resend,
            onClick: () =>
              sendVerificationEmail({
                email,
                callbackURL: `${baseURL}${redirectTo}`,
              }),
          },
        });
      } else {
        toast.error(errError?.message ?? error.message);
      }
    },
    onSuccess: () => navigate({ to: redirectTo }),
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    signInEmail({ email, password });
  };

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Log in to Glent</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.email}>
              <Label htmlFor="email">{localization.auth.email}</Label>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={localization.auth.emailPlaceholder}
                required
                disabled={isPending}
                onChange={() =>
                  setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }
                onInvalid={(e) => {
                  e.preventDefault();
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: (e.target as HTMLInputElement).validationMessage,
                  }));
                }}
                aria-invalid={!!fieldErrors.email}
              />

              <FieldError>{fieldErrors.email}</FieldError>
            </Field>

            <Field data-invalid={!!fieldErrors.password}>
              <Label htmlFor="password">{localization.auth.password}</Label>

              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }}
                  placeholder={localization.auth.passwordPlaceholder}
                  required
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  onInvalid={(e) => {
                    e.preventDefault();
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: (e.target as HTMLInputElement)
                        .validationMessage,
                    }));
                  }}
                  aria-invalid={!!fieldErrors.password}
                />

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    aria-label={
                      isPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    disabled={isPending}
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldError>{fieldErrors.password}</FieldError>
            </Field>

            <Button
              type="submit"
              disabled={isPending}
              aria-label={isPending ? "Signing in" : "Log in"}
            >
              {isPending ? <Spinner /> : localization.auth.signIn}
            </Button>
          </FieldGroup>
        </form>

        {emailAndPassword?.enabled && (
          <div className="mt-4 flex w-full justify-center">
            <FieldDescription className="text-center">
              {localization.auth.needToCreateAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signUp}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
