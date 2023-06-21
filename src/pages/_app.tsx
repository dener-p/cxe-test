import { Toaster } from "@/components/ui/toater"
import "@/styles/globals.css"
import { api } from "@/utils/api"
import { ClerkProvider } from "@clerk/nextjs"
import { type NextPage } from "next"
import { ThemeProvider } from "next-themes"
import { type AppProps } from "next/app"
import { type ReactElement, type ReactNode } from "react"

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps, router }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  const layout = getLayout(<Component {...pageProps} key={router.pathname} />)

  return (
    <ClerkProvider {...pageProps}>
      <ThemeProvider attribute="class">
        <Toaster />
        {layout}
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default api.withTRPC(MyApp)
