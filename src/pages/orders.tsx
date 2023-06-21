import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DefaultLayout from "@/components/ui/layout/defaultLayout"
import { cn } from "@/lib/utils"
import { api } from "@/utils/api"
import React from "react"

const statusMap = new Map([
  [
    "created",
    {
      text: "Criada",
      color: "text-blue-500",
    },
  ],
  [
    "pending",
    {
      text: "Pendente/Em análise",
      color: "text-yellow-500",
    },
  ],
  [
    "done",
    {
      text: "Concluída",
      color: "text-green-500",
    },
  ],
  [
    "waiting liquidation",
    {
      text: "Esperando liquidação",
      color: "text-yellow-500",
    },
  ],
  [
    "waiting new order",
    {
      text: "Novo pagamento requerido",
      color: "text-red-500",
    },
  ],
])

const convertDate = (d: string) => {
  const date = d.replace(" ", "T") + "Z"
  return new Date(date).toLocaleString()
}

export default function Orders() {
  const data = api.example.getUserOrders.useQuery()
  const status = api.example.updateStatus.useMutation()
  const link = api.example.linkPayment.useMutation({
    onSuccess: (data) => {
      window.location.href = data
    },
  })
  return (
    <>
      <h1 className="text-2xl font-bold">Histórico de pedidos</h1>
      <div className="container mx-auto flex justify-end p-3">
        <Button onClick={() => status.mutate()} size="lg">
          Atualizar
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {data.data?.map((d) => (
          <Card key={d.orderId} className="w-full">
            <CardHeader>
              <CardTitle>
                <p className="text-base">Pedido {d.orderId}</p>
              </CardTitle>
              <CardDescription>
                <div className="flex justify-between">
                  <span
                    className={cn(
                      "font-semibold",
                      statusMap.get(d.status)?.color ?? ""
                    )}
                  >
                    {statusMap.get(d.status)?.text}
                  </span>
                  <span className="text-sm ">{convertDate(d.createdAt)}</span>
                </div>
                <div className="mt-4">
                  {d.status === "waiting new order" ? (
                    <Button
                      onClick={() => link.mutate(d.orderId ?? "")}
                      size="sm"
                      disabled={link.isLoading}
                      variant="secondary"
                    >
                      Pagar restante
                    </Button>
                  ) : (
                    statusMap.get(d.status)?.text
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter className="flex w-full justify-between"></CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

Orders.getLayout = function getLayout(page: React.ReactNode) {
  return <DefaultLayout>{page}</DefaultLayout>
}
