import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

const TermosCondicoes = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img 
              src="/logos/monumenta-logo.svg" 
              alt="Monumental Atlantic" 
              className="h-10 cursor-pointer" 
              onClick={() => navigate("/")}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Termos e Condições</h1>
            <p className="text-muted-foreground">Última atualização: Janeiro 2025</p>
          </div>

          <Card className="max-w-4xl mx-auto border-2">
            <CardContent className="pt-8 prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Identificação do Prestador</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A plataforma Monumental Atlantic é operada pela Monumental Atlantic, Lda., com sede em Funchal, Madeira, Portugal. Ao utilizar os nossos serviços, aceita estes termos e condições na íntegra.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Objeto do Serviço</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Monumental Atlantic fornece uma plataforma digital para gestão de alojamento local, incluindo gestão de reservas, check-ins, relatórios fiscais (INE, taxa turística), e outras funcionalidades relacionadas com a operação de propriedades de alojamento local em Portugal.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Registo e Conta</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Para utilizar a plataforma, é necessário criar uma conta fornecendo informações verdadeiras e atualizadas. O utilizador é responsável por:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Manter a confidencialidade das suas credenciais de acesso</li>
                  <li>Todas as atividades realizadas através da sua conta</li>
                  <li>Notificar imediatamente qualquer uso não autorizado</li>
                  <li>Garantir a veracidade dos dados inseridos na plataforma</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Planos e Pagamentos</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Oferecemos diferentes planos de subscrição com funcionalidades variadas:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong>Basic (7€/mês):</strong> 1 propriedade, gestão básica</li>
                  <li><strong>Pro (19€/mês):</strong> Até 5 propriedades, funcionalidades avançadas</li>
                  <li><strong>Premium (49€/mês):</strong> Propriedades ilimitadas, suporte dedicado</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Os pagamentos são processados mensalmente ou anualmente, conforme a opção escolhida. A renovação é automática salvo cancelamento prévio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Cancelamento e Reembolso</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pode cancelar a sua subscrição a qualquer momento através das definições da conta. O cancelamento tem efeito no final do período de faturação atual. Não são emitidos reembolsos por períodos parciais, exceto nos casos previstos na lei de proteção do consumidor.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Obrigações do Utilizador</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  O utilizador compromete-se a:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Utilizar a plataforma de acordo com a legislação aplicável</li>
                  <li>Não utilizar a plataforma para fins ilegais ou não autorizados</li>
                  <li>Manter os dados das propriedades e hóspedes atualizados e corretos</li>
                  <li>Cumprir todas as obrigações fiscais e regulatórias aplicáveis ao AL</li>
                  <li>Não interferir com o funcionamento normal da plataforma</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Monumental Atlantic fornece a plataforma "tal como está". Não garantimos que o serviço seja ininterrupto ou livre de erros. Não nos responsabilizamos por perdas indiretas, consequenciais ou punitivas decorrentes da utilização da plataforma. A nossa responsabilidade total está limitada ao valor pago pelo utilizador nos 12 meses anteriores ao evento.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Propriedade Intelectual</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Todos os direitos de propriedade intelectual sobre a plataforma, incluindo software, design, logótipos e conteúdos, pertencem à Monumental Atlantic. É concedida ao utilizador uma licença limitada e não exclusiva para utilização da plataforma durante o período de subscrição.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Proteção de Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O tratamento de dados pessoais é regido pela nossa Política de Privacidade, que constitui parte integrante destes termos. Ao aceitar estes termos, confirma ter lido e aceite a nossa Política de Privacidade.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Alterações aos Termos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas com pelo menos 30 dias de antecedência. A continuação da utilização da plataforma após as alterações constitui aceitação dos novos termos.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Resolução de Conflitos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Estes termos são regidos pela lei portuguesa. Qualquer litígio será submetido à jurisdição exclusiva dos tribunais do Funchal, Madeira, sem prejuízo dos direitos do consumidor previstos na lei.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Contacto</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para questões sobre estes termos, contacte-nos através de:
                </p>
                <p className="text-muted-foreground mt-4">
                  <strong>Email:</strong> geral@monumentalatlantic.pt<br />
                  <strong>Morada:</strong> Funchal, Madeira, Portugal
                </p>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2025 Monumental Atlantic. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default TermosCondicoes;
