"use client";

import { useAuth, useSignUpEmail } from "@better-auth-ui/react";
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

export type SignUpProps = {
  className?: string;
};

export function SignUp({ className }: SignUpProps) {
  const {
    basePaths,
    emailAndPassword,
    localization,
    redirectTo,
    viewPaths,
    navigate,
    Link,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: signUpEmail, isPending } = useSignUpEmail({
    onError: (error) => {
      setPassword("");
      toast.error(error.error?.message || error.message, { duration: 8000 });
    },
    onSuccess: () => {
      if (emailAndPassword?.requireEmailVerification) {
        toast.success(localization.auth.verifyYourEmail, { duration: 8000 });
        navigate({ to: `${basePaths.auth}/${viewPaths.auth.signIn}` });
      } else {
        navigate({ to: redirectTo });
      }
    },
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    signUpEmail({ name, email, password, callbackURL: redirectTo });
  };

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Create your Glent account
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!fieldErrors.name}>
              <Label htmlFor="name">{localization.auth.name}</Label>

              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={localization.auth.namePlaceholder}
                required
                disabled={isPending}
                onChange={() =>
                  setFieldErrors((prev) => ({ ...prev, name: undefined }))
                }
                onInvalid={(e) => {
                  e.preventDefault();
                  setFieldErrors((prev) => ({
                    ...prev,
                    name: (e.target as HTMLInputElement).validationMessage,
                  }));
                }}
                aria-invalid={!!fieldErrors.name}
              />

              <FieldError>{fieldErrors.name}</FieldError>
            </Field>

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
                  autoComplete="new-password"
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
                    aria-label={
                      isPasswordVisible
                        ? localization.auth.hidePassword
                        : localization.auth.showPassword
                    }
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff /> : <Eye />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <FieldError>{fieldErrors.password}</FieldError>
            </Field>

            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {localization.auth.signUp}
            </Button>
          </FieldGroup>
        </form>

        {emailAndPassword?.enabled && (
          <div className="mt-4 flex w-full justify-center">
            <FieldDescription className="text-center">
              {localization.auth.alreadyHaveAnAccount}{" "}
              <Link
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                className="underline underline-offset-4"
              >
                {localization.auth.signIn}
              </Link>
            </FieldDescription>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
