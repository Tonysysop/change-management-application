import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/user-auth-form-signup";
import logo_icon from '../assets/logo.png'
import {Quotes} from '../../utils/quotes'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';


export default function AuthenticationPage() {
  return (
    <>
      <div className="md:hidden">
        {/* <img
          src=""
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <img
          src=""
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        /> */}
      </div>

      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          to="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-20 md:top-20"
          )}
        >
          <FontAwesomeIcon className="mr-2" icon={faArrowRight} />Login
        </Link>

        {/*acme container*/}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className=" bg-peter bg-cover opacity-60 absolute inset-0" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            {/* SVG code here */}
            <img src={logo_icon} alt="" />
          </div>
          <div className="relative z-20 mt-auto text-black dark:text-white">
            <Quotes />
          </div>
        </div>
        {/*acme container*/}

        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-orange-400" > 
                Change Management System 
              </h2>
              <h3 className="text-l font-semibold p-2 tracking-tight">
                Create an account
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <a
                 href="https://www.ibedc.com/terms-of-service"
                 className="underline underline-offset-4 hover:text-orange-500"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                Terms of Service {""} 
              </a>

               and{" "}
              <a
                href="https://www.ibedc.com/privacy-policy"
                className="underline underline-offset-4 hover:text-orange-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
