import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { LiveMetricCard } from "@/app/components/live-metric-card"

export default function LivePage() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Monitoramento em Tempo Real</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <LiveMetricCard title="Potência Ativa Total" value="-3.237" unit="kW" isNegative={true} />

        <LiveMetricCard title="Corrente Total" value="39.523" unit="A" isNegative={false} />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Frequência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            60<span className="text-lg font-normal">Hz</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="phase-a" className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="phase-a" className="text-red-500">
            Fase A
          </TabsTrigger>
          <TabsTrigger value="phase-b" className="text-emerald-500">
            Fase B
          </TabsTrigger>
          <TabsTrigger value="phase-c" className="text-blue-500">
            Fase C
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phase-a">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tensão A</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  127.6<span className="text-lg font-normal ml-1">V</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Corrente A</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  16.060<span className="text-lg font-normal ml-1">A</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fator de Potência A</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0.47</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Potência Ativa A</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  -0.957<span className="text-lg font-normal ml-1">kW</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="phase-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tensão B</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  128.2<span className="text-lg font-normal ml-1">V</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Corrente B</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  12.34<span className="text-lg font-normal ml-1">A</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fator de Potência B</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0.52</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Potência Ativa B</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">
                  -1.124<span className="text-lg font-normal ml-1">kW</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="phase-c">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tensão C</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  126.8<span className="text-lg font-normal ml-1">V</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Corrente C</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  11.12<span className="text-lg font-normal ml-1">A</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fator de Potência C</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0.49</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Potência Ativa C</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">
                  -1.156<span className="text-lg font-normal ml-1">kW</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
