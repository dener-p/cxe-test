import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DefaultLayout from "@/components/ui/layout/defaultLayout"
import { api } from "@/utils/api"
import { useRouter } from "next/router"
import React from "react"

export default function Apis() {
  const router = useRouter()
  const save = api.example.registerApi.useMutation({
    onSuccess: () => {
      router.push("/orders")
    },
  })
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const apikey = e.currentTarget.apikey.value
        const secret = e.currentTarget.secret.value
        save.mutate({
          apikey,
          apisecret: secret,
        })
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="apikey">apikey</Label>
        <Input type="text" id="apikey" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="secret">secret</Label>
        <Input type="text" id="secret" required />
      </div>
      <Button disabled={save.isLoading || save.isSuccess}>Salvar</Button>
    </form>
  )
}

Apis.getLayout = function getLayout(page: React.ReactNode) {
  return <DefaultLayout>{page}</DefaultLayout>
}
