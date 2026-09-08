import {AgendaWorkspace} from '@/components/agenda-workspace';
import {PageHeading} from '@/components/page-heading';
import {requireActivePsychologist} from '@/lib/authz';
export default async function AgendaPage(){const auth=await requireActivePsychologist();if(!auth)return null;return <><PageHeading eyebrow="Seu dia, com espaço" title="Agenda" description="Encontros, horários livres e próximos passos em uma só visão."/><AgendaWorkspace professionalSlug={auth.professional.public_slug}/></>}
