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
import { api } from "@/utils/api"
import { atom, useAtom } from "jotai"
import { Minus, Plus } from "lucide-react"

export const formartBrl = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export const productsAtom = atom<
  {
    name: string
    price: number
    quantity: number
    description: string
  }[]
>([])

export default function Home() {
  const data = api.example.products.useQuery()
  const [products, setProducts] = useAtom(productsAtom)
  const handleAdd = (product: {
    name: string
    price: number
    description: string
  }) => {
    setProducts((prev) => {
      const productExists = prev.find((p) => p.name === product.name)
      if (productExists) {
        localStorage.setItem(
          "products",
          JSON.stringify(
            prev.map((p) => {
              if (p.name === product.name) {
                return {
                  ...p,
                  quantity: p.quantity + 1,
                }
              }
              return p
            })
          )
        )
        return prev.map((p) => {
          if (p.name === product.name) {
            return {
              ...p,
              quantity: p.quantity + 1,
            }
          }
          return p
        })
      }
      localStorage.setItem(
        "products",
        JSON.stringify([
          ...prev,
          {
            ...product,
            quantity: 1,
          },
        ])
      )
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ]
    })
  }

  const handleRemove = (product: {
    name: string
    price: number
    description: string
  }) => {
    setProducts((prev) => {
      const productExists = prev.find((p) => p.name === product.name)
      if (productExists) {
        if (productExists.quantity === 1) {
          localStorage.setItem(
            "products",
            JSON.stringify(prev.filter((p) => p.name !== product.name))
          )
          return prev.filter((p) => p.name !== product.name)
        }
        localStorage.setItem(
          "products",
          JSON.stringify(
            prev.map((p) => {
              if (p.name === product.name) {
                return {
                  ...p,
                  quantity: p.quantity - 1,
                }
              }
              return p
            })
          )
        )
        return prev.map((p) => {
          if (p.name === product.name) {
            return {
              ...p,
              quantity: p.quantity - 1,
            }
          }
          return p
        })
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ]
    })
  }

  return (
    <>
      <h1 className="text-6xl font-bold ">Welcome to E-commerce</h1>
      <div className="grid grid-cols-4 gap-8">
        {data.data?.map((product) => (
          <Card key={product.name} className="w-full">
            <CardHeader>
              <CardTitle>
                {product.name} - {formartBrl(product.price)}
              </CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter className="flex w-full justify-between">
              {products.find((p) => p.name === product.name) ? (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemove(product)}
                  >
                    <Minus />
                  </Button>
                  {products.find((p) => p.name === product.name)?.quantity}
                  <Button
                    variant="secondary"
                    onClick={() => handleAdd(product)}
                  >
                    <Plus />
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => handleAdd(product)}
                  className="w-full"
                >
                  Adicionar ao carrinho
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  )
}

Home.getLayout = function getLayout(page: React.ReactNode) {
  return <DefaultLayout>{page}</DefaultLayout>
}
