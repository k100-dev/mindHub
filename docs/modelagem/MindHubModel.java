import java.awt.geom.Point2D;
import java.util.*;
import com.change_vision.jude.api.inf.AstahAPI;
import com.change_vision.jude.api.inf.editor.*;
import com.change_vision.jude.api.inf.model.*;
import com.change_vision.jude.api.inf.presentation.*;
import com.change_vision.jude.api.inf.project.ProjectAccessor;

public class MindHubModel {
 static ProjectAccessor pa; static BasicModelEditor b; static IModel root;
 static Map<String,IClass> classes=new LinkedHashMap<>();
 static Point2D pt(double x,double y){return new Point2D.Double(x,y);}
 static INodePresentation size(INodePresentation n,double w,double h)throws Exception{n.setWidth(w);n.setHeight(h);return n;}
 static IPackage pkg(String name)throws Exception{return b.createPackage(root,name);}
 static INodePresentation node(StructureDiagramEditor e,IElement m,double x,double y)throws Exception{return e.createNodePresentation(m,pt(x,y));}
 static void text(DiagramEditor e,String s,double x,double y)throws Exception{e.createText(s,pt(x,y));}
 static IClass cls(IPackage p,String name,String... attrs)throws Exception{
  IClass c=b.createClass(p,name);classes.put(name,c);
  for(String a:attrs){String[] pair=a.split(":",2);b.createAttribute(c,pair[0],pair[1]).setVisibility("private");}
  return c;
 }
 static void assoc(ClassDiagramEditor e,IClass a,IClass z,INodePresentation ap,INodePresentation zp,String label,String am,String zm)throws Exception{
  IAssociation link=b.createAssociation(a,z,label,"","");link.getMemberEnds()[0].setMultiplicityString(am);link.getMemberEnds()[1].setMultiplicityString(zm);ILinkPresentation drawn=e.createLinkPresentation(link,ap,zp); if(a.getName().equals("Profissional") && z.getName().equals("BloqueioAgenda")) drawn.setAllPoints(new Point2D[]{pt(20,140),pt(-45,140),pt(-45,790),pt(20,790)});
 }
 static void useCases()throws Exception{
  IPackage p=pkg("01 - Casos de uso");UseCaseModelEditor u=pa.getModelEditorFactory().getUseCaseModelEditor();
  IClass patient=u.createActor(p,"Paciente"),pro=u.createActor(p,"Profissional");
  String[][] groups={{"UC01 - Cadastrar conta","UC02 - Entrar e recuperar acesso","UC03 - Consultar horários","UC04 - Solicitar agendamento","UC05 - Acompanhar atendimento","UC06 - Cancelar atendimento","UC07 - Remarcar atendimento"},{"UC08 - Gerenciar pacientes","UC09 - Definir disponibilidade","UC10 - Bloquear períodos","UC11 - Conferir e registrar pagamento","UC12 - Confirmar atendimento","UC13 - Registrar conclusão ou ausência","UC14 - Registrar reembolso","UC15 - Configurar sessão e pagamento"}};
  for(int g=0;g<groups.length;g++){
   UseCaseDiagramEditor e=pa.getDiagramEditorFactory().getUseCaseDiagramEditor();e.createUseCaseDiagram(p,g==0?"UC - Jornada do paciente":"UC - Gestão profissional");
   INodePresentation actor=node(e,g==0?patient:pro,45,240);text(e,"MindHub — "+(g==0?"autoatendimento":"gestão do atendimento"),240,15);
   for(int i=0;i<groups[g].length;i++){
    IUseCase c=u.createUseCase(p,groups[g][i]);c.setDefinition("Escopo implementado: "+groups[g][i]+". Autorização pelo perfil e propriedade dos dados. Regras detalhadas no guia de modelagem.");
    INodePresentation n=size(node(e,c,240,i*85+65),335,55);ILinkPresentation edge=e.createLinkPresentation(b.createAssociation(g==0?patient:pro,c,"","",""),actor,n);edge.setAllPoints(new Point2D[]{pt(65,270),pt(130,270),pt(200,i*85+92),pt(240,i*85+92)});
   }
  }
 }
 static void domain()throws Exception{
  IPackage p=pkg("02 - Domínio e dados");
  IClass profile=cls(p,"Perfil","id:UUID","nome:String","telefone:String","papel:Papel","situacao:SituacaoConta");
  IClass patient=cls(p,"Paciente","dataNascimento:Date","situacao:SituacaoPaciente");
  IClass pro=cls(p,"Profissional","nomeProfissional:String","slug:String","duracaoMinutos:int","precoSessao:Decimal","valorSinal:Decimal","instrucoesPagamento:String");
  IClass link=cls(p,"VinculoPaciente","id:UUID","situacao:SituacaoPaciente");
  IClass booking=cls(p,"Agendamento","id:UUID","inicio:Instant","fim:Instant","situacao:SituacaoAgendamento","precoRegistrado:Decimal","sinalRegistrado:Decimal","totalPago:Decimal","valorReembolso:Decimal","situacaoReembolso:SituacaoReembolso","versao:int");
  for(String op:new String[]{"solicitar","confirmar","cancelar","remarcar","registrarPagamento","registrarReembolso"})b.createOperation(booking,op,"void");
  IClass payment=cls(p,"Pagamento","id:UUID","valor:Decimal","situacao:SituacaoPagamento","meio:String","confirmadoEm:Instant");
  IClass rule=cls(p,"Disponibilidade","diaSemana:int","inicio:Time","fim:Time","vigenciaInicial:Date","vigenciaFinal:Date","ativa:boolean");
  IClass block=cls(p,"BloqueioAgenda","inicio:Instant","fim:Instant","motivoAdministrativo:String","ativo:boolean");
  IClass event=cls(p,"EventoAgendamento","id:Long","estadoAnterior:String","estadoNovo:String","motivo:String","criadoEm:Instant");
  ClassDiagramEditor e=pa.getDiagramEditorFactory().getClassDiagramEditor();e.createClassDiagram(p,"CL01 - Pessoas e vínculos");
  INodePresentation pn=size(node(e,profile,350,50),270,175),patientN=size(node(e,patient,70,350),245,115),proN=size(node(e,pro,650,320),270,225),ln=size(node(e,link,360,630),260,105);
  assoc(e,profile,patient,pn,patientN,"perfil do paciente","1","0..1");assoc(e,profile,pro,pn,proN,"perfil profissional","1","0..1");assoc(e,patient,link,patientN,ln,"possui","1","0..*");assoc(e,pro,link,proN,ln,"mantém","1","0..*");
  text(e,"Perfil define o acesso. Paciente e Profissional são perfis especializados por composição.\nVínculo é administrativo; não contém prontuário.",70,790);
  e.createClassDiagram(p,"CL02 - Agenda e financeiro");
  INodePresentation bn=size(node(e,booking,400,180),300,360),prn=size(node(e,pro,20,35),270,215),pan=size(node(e,patient,820,35),240,120),rn=size(node(e,rule,20,410),260,180),bln=size(node(e,block,20,710),260,155),payn=size(node(e,payment,820,350),260,165),en=size(node(e,event,820,650),260,165);
  assoc(e,pro,booking,prn,bn,"gerencia","1","0..*");assoc(e,patient,booking,pan,bn,"solicita","1","0..*");assoc(e,pro,rule,prn,rn,"define","1","0..*");assoc(e,pro,block,prn,bln,"bloqueia","1","0..*");assoc(e,booking,payment,bn,payn,"registra","1","0..*");assoc(e,booking,event,bn,en,"histórico","1","1..*");
  text(e,"Agendamento pendente bloqueia o intervalo sem expiração.\nPagamento recebido não confirma automaticamente o atendimento.\nRemarcação preserva id, valores e histórico; troca o intervalo em uma transação.",385,750);
  // Logical relational view using editable UML classes, supported by Astah UML.
  e.createClassDiagram(p,"DER - Modelo relacional em notação UML");
  String[][] tables={{"profiles","user_id:UUID PK","role:enum","name:text","phone:text","status:enum"},{"psychologist_profiles","user_id:UUID PK FK profiles","public_slug:text UNIQUE","session_duration_minutes:int","session_price:numeric","deposit_amount:numeric"},{"patient_profiles","user_id:UUID PK FK profiles","birth_date:date","status:enum"},{"appointments","id:UUID PK","psychologist_id:UUID FK","patient_id:UUID FK","starts_at:timestamptz","ends_at:timestamptz","status:enum","paid_amount:numeric","refund_status:text"},{"payments","id:UUID PK","appointment_id:UUID FK","amount:numeric","status:enum","provider:text"},{"appointment_events","id:bigint PK","appointment_id:UUID FK","actor_id:UUID FK","previous_status:enum","new_status:enum"},{"availability_rules","id:UUID PK","psychologist_id:UUID FK","weekday:smallint","starts_at:time","ends_at:time"},{"schedule_blocks","id:UUID PK","psychologist_id:UUID FK","starts_at:timestamptz","ends_at:timestamptz","active:boolean"},{"psychologist_patients","id:UUID PK","psychologist_id:UUID FK","patient_id:UUID FK","status:enum"}};
  Map<String,IClass> tm=new HashMap<>();
  for(String[] t:tables){IClass c=cls(p,t[0],Arrays.copyOfRange(t,1,t.length));c.addStereotype("table");tm.put(t[0],c);}
  String[][] views={{"profiles","psychologist_profiles","patient_profiles","psychologist_patients"},{"psychologist_profiles","patient_profiles","appointments","payments","appointment_events"},{"psychologist_profiles","availability_rules","schedule_blocks"}};
  double[][][] positions={{{410,40},{40,370},{780,370},{410,740}},{{40,40},{800,40},{420,360},{40,770},{800,770}},{{420,40},{40,410},{800,410}}};
  String[][][] refs={{{"profiles","psychologist_profiles"},{"profiles","patient_profiles"},{"psychologist_profiles","psychologist_patients"},{"patient_profiles","psychologist_patients"}},{{"psychologist_profiles","appointments"},{"patient_profiles","appointments"},{"appointments","payments"},{"appointments","appointment_events"}},{{"psychologist_profiles","availability_rules"},{"psychologist_profiles","schedule_blocks"}}};
  for(int v=0;v<views.length;v++){
   if(v>0)e.createClassDiagram(p,v==1?"DER02 - Atendimentos e recebimentos":"DER03 - Disponibilidade e bloqueios");
   Map<String,INodePresentation> tn=new HashMap<>();
   for(int i=0;i<views[v].length;i++)tn.put(views[v][i],size(node(e,tm.get(views[v][i]),positions[v][i][0],positions[v][i][1]),290,240));
   for(String[] r:refs[v])assoc(e,tm.get(r[0]),tm.get(r[1]),tn.get(r[0]),tn.get(r[1]),"FK","1",r[0].equals("profiles")?"0..1":"0..*");
   text(e,"Visão relacional em notação UML. Mesmas entidades compartilhadas entre as vistas.\nChaves estrangeiras, RLS e exclusão de intervalos protegem os dados.",40,v==2?780:1090);
  }
 }
 static void sequence(IPackage p,String title,String[] lifelines,String[][] messages)throws Exception{
  SequenceDiagramEditor e=pa.getDiagramEditorFactory().getSequenceDiagramEditor();e.createSequenceDiagram(p,title);
  List<INodePresentation> lines=new ArrayList<>();for(int i=0;i<lifelines.length;i++)lines.add(e.createLifeline(lifelines[i],70+i*300));
  double y=160;
  for(String[] m:messages){int from=Integer.parseInt(m[0]),to=Integer.parseInt(m[1]);ILinkPresentation msg=e.createMessage(m[2],lines.get(from),lines.get(to),y);if(m.length>3)e.createReturnMessage(m[3],msg);y+=100;}
 }
 static void sequences()throws Exception{
  IPackage p=pkg("03 - Sequências");
  sequence(p,"SQ01 - Cadastro",new String[]{"Paciente","Formulário","API cadastro","Supabase Auth","PostgreSQL"},new String[][]{{"0","1","informar nome, e-mail, telefone e senhas"},{"1","2","POST /api/auth/register"},{"2","2","validar dados e confirmação de senha"},{"2","3","signUp","resultado do cadastro"},{"3","4","trigger: criar Perfil PATIENT e Paciente","conta persistida"},{"1","0","orientar confirmação se necessária"}});
  sequence(p,"SQ02 - Login e autorização",new String[]{"Usuário","Formulário","Supabase Auth","API /me","PostgreSQL"},new String[][]{{"0","1","informar e-mail e senha"},{"1","2","signInWithPassword","sessão válida ou erro"},{"1","3","GET /api/me com sessão"},{"3","2","validar identidade","usuário autenticado"},{"3","4","consultar papel e situação","perfil"},{"3","1","retornar perfil autorizado"},{"1","0","abrir área do paciente ou profissional"}});
  sequence(p,"SQ03 - Solicitar agendamento",new String[]{"Paciente","Agenda","API holds","PostgreSQL"},new String[][]{{"0","1","escolher horário e solicitar"},{"1","2","POST /api/appointments/holds"},{"2","2","validar sessão PATIENT ativa"},{"2","3","create_appointment_hold_for_patient"},{"3","3","bloquear profissional; validar disponibilidade"},{"3","3","inserir reserva e evento na mesma transação"},{"3","2","reserva pendente ou conflito"},{"2","1","201 reserva / 409 horário ocupado"},{"1","0","exibir Agendamento pendente e instruções"}});
  sequence(p,"SQ04 - Conferência e confirmação",new String[]{"Profissional","Dashboard","API manage","PostgreSQL"},new String[][]{{"0","1","abrir Novo atendimento"},{"0","0","conferir recebimento fora da plataforma"},{"1","2","PAYMENT: informar total recebido"},{"2","3","registrar pagamento; manter pendente","registro salvo"},{"0","0","entrar em contato com paciente"},{"1","2","CONFIRM: confirmar atendimento"},{"2","3","validar sinal e mudar estado","CONFIRMADO"},{"2","1","atendimento atualizado"}});
  sequence(p,"SQ05 - Cancelamento e reembolso",new String[]{"Paciente","API manage","PostgreSQL","Profissional"},new String[][]{{"0","1","CANCEL: confirmar cancelamento"},{"1","2","validar proprietário e antecedência"},{"2","2","cancelar e liberar intervalo"},{"2","2","24h ou mais: reembolso pendente; menos: sem reembolso"},{"2","1","resultado da transação"},{"1","0","informar situação e valor"},{"3","3","devolver valor externamente quando elegível"},{"3","1","REFUND: registrar devolução realizada"},{"1","2","marcar reembolso concluído"}});
  sequence(p,"SQ06 - Remarcação atômica",new String[]{"Paciente","Agenda","API manage","PostgreSQL"},new String[][]{{"0","1","selecionar novo horário"},{"1","2","RESCHEDULE: novo início"},{"2","3","validar proprietário e limite de 24h"},{"3","3","bloquear registros e validar novo intervalo"},{"3","3","trocar horário; preservar valores; registrar histórico"},{"3","2","commit ou rollback integral"},{"2","1","pendente no novo horário / conflito"},{"1","0","mostrar resultado; manter original se conflito"}});
 }
 static void transition(StateMachineDiagramEditor e,INodePresentation a,INodePresentation z,String event,String guard)throws Exception{ILinkPresentation link=e.createTransition(a,z);ITransition t=(ITransition)link.getModel();if(!event.isEmpty())t.setEvent(event);if(!guard.isEmpty())t.setGuard(guard);if(event.equals("remarcar"))link.setAllPoints(new Point2D[]{pt(760,70),pt(760,-50),pt(310,-50),pt(310,70)});}
 static void states()throws Exception{
  IPackage p=pkg("04 - Estados e atividades");StateMachineDiagramEditor e=pa.getDiagramEditorFactory().getStateMachineDiagramEditor();e.createStatemachineDiagram(p,"SM01 - Ciclo do agendamento");
  INodePresentation initial=e.createInitialPseudostate(null,pt(50,100)),pending=size(e.createState("Agendamento pendente",null,pt(180,70)),260,100),confirmed=size(e.createState("Confirmado",null,pt(650,70)),220,100),cancel=size(e.createState("Cancelado",null,pt(190,410)),220,90),done=size(e.createState("Realizado",null,pt(650,410)),220,90),absent=size(e.createState("Não compareceu",null,pt(1020,410)),220,90);
  transition(e,initial,pending,"","");transition(e,pending,confirmed,"confirmar","sinal recebido");transition(e,pending,cancel,"cancelar","");transition(e,confirmed,cancel,"cancelar","");transition(e,confirmed,pending,"remarcar",">= 24h");transition(e,confirmed,done,"realizar","encerrado");transition(e,confirmed,absent,"ausência","encerrado");
  text(e,"Pendente e Confirmado bloqueiam a agenda. Sem expiração automática.\nRemarcação de pendente mantém o estado e troca o intervalo.\nCancelar e remarcar são transações; pagamento tem estado independente.",170,600);
  e.createStatemachineDiagram(p,"SM02 - Reembolso manual");
  initial=e.createInitialPseudostate(null,pt(30,150));INodePresentation none=size(e.createState("Sem solicitação",null,pt(130,110)),220,100),refund=size(e.createState("Reembolso pendente",null,pt(600,40)),250,100),notEligible=size(e.createState("Sem reembolso",null,pt(600,330)),250,100),completed=size(e.createState("Reembolso realizado",null,pt(1050,40)),250,100);
  transition(e,initial,none,"","");transition(e,none,refund,"cancelar",">= 24h ou profissional");transition(e,none,notEligible,"cancelar pelo paciente","< 24h");transition(e,refund,completed,"registrar devolução","valor devolvido");
  text(e,"Valor reembolsável = total efetivamente recebido. A plataforma registra, mas não transfere dinheiro.\nSe o pagamento ainda não foi conferido no cancelamento, a profissional pode registrá-lo antes do reembolso.",130,520);
  ActivityDiagramEditor a=pa.getDiagramEditorFactory().getActivityDiagramEditor();a.createActivityDiagram(p,"AT01 - Solicitação até confirmação");
  INodePresentation prev=a.createInitialNode("Início",pt(270,30));String[] steps={"Paciente acessa a conta","Paciente escolhe horário disponível","Sistema cria reserva pendente e bloqueia horário","Paciente segue instruções de pagamento","Profissional abre pendência no dashboard","Profissional confere e registra sinal recebido","Profissional entra em contato com paciente","Profissional confirma atendimento"};
  for(int i=0;i<steps.length;i++){INodePresentation n=size(a.createAction(steps[i],pt(80,100+i*110)),440,65);a.createFlow(prev,n);prev=n;}
  a.createFlow(prev,a.createFinalNode("Fim",pt(270,1010)));text(a,"Fluxo principal. Conflitos, cancelamento e remarcação:\nSQ03, SQ05, SQ06 e SM01. Pagamento automático fora desta versão.",610,180);
 }
 static void architecture()throws Exception{
  IPackage p=pkg("05 - Arquitetura");ClassDiagramEditor e=pa.getDiagramEditorFactory().getClassDiagramEditor();e.createClassDiagram(p,"AR01 - Componentes (visão estrutural UML)");
  String[] names={"Interface do paciente","Interface profissional","Autenticação e autorização","API de agenda e pacientes","Regras transacionais","Persistência"};IClass[] cs=new IClass[names.length];INodePresentation[] ns=new INodePresentation[names.length];
  for(int i=0;i<names.length;i++){cs[i]=cls(p,names[i]);cs[i].addStereotype("component");ns[i]=size(node(e,cs[i],new double[]{50,600,950,330,330,330}[i],new double[]{40,40,360,360,650,930}[i]),330,100);}
  for(int[] r:new int[][]{{0,3},{1,3},{3,2},{3,4},{4,5}})e.createLinkPresentation(b.createDependency(cs[r[1]],cs[r[0]],"usa"),ns[r[1]],ns[r[0]]);
  text(e,"Componentes lógicos do Next.js; banco Supabase/PostgreSQL.\nNotação estrutural editável: a API Astah UML não cria a aba nativa de componentes.",50,1120);
  e.createClassDiagram(p,"AR02 - Implantação (visão estrutural UML)");
  String[] hosts={"Dispositivo do usuário","Netlify","Supabase Auth","Supabase PostgreSQL"};IClass[] hs=new IClass[4];INodePresentation[] hn=new INodePresentation[4];
  for(int i=0;i<4;i++){hs[i]=cls(p,hosts[i]);hs[i].addStereotype("node");hn[i]=size(node(e,hs[i],i==0?40:i==1?420:850,i==0?50:i==1?380:i==2?50:650),290,120);}
  e.createLinkPresentation(b.createDependency(hs[1],hs[0],"HTTPS"),hn[1],hn[0]);e.createLinkPresentation(b.createDependency(hs[2],hs[0],"HTTPS / autenticação"),hn[2],hn[0]);e.createLinkPresentation(b.createDependency(hs[2],hs[1],"validar sessão"),hn[2],hn[1]);e.createLinkPresentation(b.createDependency(hs[3],hs[1],"HTTPS / PostgREST e RPC"),hn[3],hn[1]);
  text(e,"Navegador: celular ou notebook. Netlify: Next.js e rotas de servidor.\nSupabase: autenticação, dados, RLS e funções transacionais. Chave administrativa somente no servidor.\nRepresentação editável em visão estrutural; sem cobrança automática nesta entrega.",40,900);
 }
 public static void main(String[] args)throws Exception{
  pa=AstahAPI.getAstahAPI().getProjectAccessor();pa.create(args[0]);root=pa.getProject();TransactionManager.beginTransaction();
  try{root.setName("MindHub - Modelagem do produto");b=pa.getModelEditorFactory().getBasicModelEditor();System.out.println("UC");useCases();System.out.println("DOMAIN");domain();System.out.println("SEQUENCES");sequences();System.out.println("STATES");states();System.out.println("ARCH");architecture();TransactionManager.endTransaction();pa.validateProject();pa.save();System.out.println("SAVED "+args[0]+" diagrams="+pa.findElements(IDiagram.class).length);pa.close();}catch(Exception ex){java.io.StringWriter sw=new java.io.StringWriter();ex.printStackTrace(new java.io.PrintWriter(sw));java.nio.file.Files.writeString(java.nio.file.Path.of("model-error.txt"),sw.toString());TransactionManager.abortTransaction();System.out.println(sw);System.exit(1);}
 }
}
