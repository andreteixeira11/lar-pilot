import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

const PoliticaPrivacidade = () => {
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
              alt="Monumenta Atlantic" 
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
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-muted-foreground">Última atualização: Janeiro 2025</p>
          </div>

          <Card className="max-w-4xl mx-auto border-2">
            <CardContent className="pt-8 prose prose-slate dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Monumental Atlantic compromete-se a proteger a privacidade dos utilizadores da nossa plataforma de gestão de alojamento local. Esta política descreve como recolhemos, utilizamos, armazenamos e protegemos os seus dados pessoais.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Dados que Recolhemos</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Recolhemos os seguintes tipos de informação:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Informações de identificação pessoal (nome, email, telefone)</li>
                  <li>Dados das propriedades de alojamento local</li>
                  <li>Informações de reservas e hóspedes</li>
                  <li>Dados financeiros relacionados com reservas</li>
                  <li>Informações de utilização da plataforma</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Finalidade do Tratamento</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Utilizamos os seus dados para:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Fornecer e melhorar os nossos serviços de gestão de AL</li>
                  <li>Processar reservas e check-ins</li>
                  <li>Gerar relatórios fiscais e estatísticos (INE, taxa turística)</li>
                  <li>Comunicar consigo sobre a sua conta e serviços</li>
                  <li>Cumprir obrigações legais e regulatórias</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Base Legal</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O tratamento dos seus dados é baseado no contrato de prestação de serviços, no seu consentimento quando aplicável, e no cumprimento de obrigações legais, nomeadamente as relacionadas com o registo de hóspedes e obrigações fiscais.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Partilha de Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Não vendemos os seus dados pessoais. Podemos partilhar informações com autoridades competentes quando legalmente exigido (SEF, INE, Finanças) e com prestadores de serviços que nos auxiliam na operação da plataforma, sempre com as devidas garantias de proteção de dados.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Segurança</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos encriptação, controlos de acesso e monitorização regular dos nossos sistemas.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Mantemos os seus dados pelo período necessário para cumprir as finalidades descritas e as obrigações legais aplicáveis. Dados de hóspedes são mantidos pelo período legalmente exigido para fins fiscais e de segurança.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Os Seus Direitos</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ao abrigo do RGPD, tem direito a:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Aceder aos seus dados pessoais</li>
                  <li>Retificar dados incorretos</li>
                  <li>Solicitar a eliminação dos seus dados</li>
                  <li>Limitar ou opor-se ao tratamento</li>
                  <li>Portabilidade dos dados</li>
                  <li>Retirar o consentimento a qualquer momento</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para melhorar a experiência do utilizador. Pode gerir as suas preferências de cookies nas definições do seu navegador.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Contacto</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para exercer os seus direitos ou esclarecer questões sobre esta política, contacte-nos através de:
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

export default PoliticaPrivacidade;
