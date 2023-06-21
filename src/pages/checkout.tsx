import { Button } from "@/components/ui/button"
import DefaultLayout from "@/components/ui/layout/defaultLayout"
import { api } from "@/utils/api"
import { useAtom } from "jotai"
import { formartBrl, productsAtom } from "."

export default function Checkout() {
  const [products] = useAtom(productsAtom)
  const total = products.reduce((acc, curr) => {
    return acc + curr.price * curr.quantity
  }, 0)

  const pay = api.example.createCxPagOrder.useMutation({
    onSuccess: (data) => {
      // redirect to payment page
      localStorage.removeItem("products")
      window.location.href = data
    },
  })
  return (
    <>
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="flex flex-col items-center justify-center gap-4">
        <span className="text-xl font-bold">Total: {formartBrl(total)}</span>
        <Button
          size="lg"
          onClick={() => {
            pay.mutate({
              products: products,
            })
          }}
          disabled={products.length === 0 || pay.isLoading}
        >
          Pagar com CxPag
        </Button>
      </div>
    </>
  )
}

Checkout.getLayout = function getLayout(page: React.ReactNode) {
  return <DefaultLayout>{page}</DefaultLayout>
}
