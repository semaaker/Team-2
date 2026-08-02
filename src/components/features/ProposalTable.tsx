import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Icon,
  IconButton,
  InlineSelect,
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableRow,
} from '@/components/ui';
import { useToast } from '@/store';
import { eventService } from '@/services';
import { PROPOSAL_STATUS_LABELS } from '@/utils/constants';
import type { Proposal, ProposalStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: 'pending', label: PROPOSAL_STATUS_LABELS.pending },
  { value: 'approved', label: PROPOSAL_STATUS_LABELS.approved },
  { value: 'cancelled', label: PROPOSAL_STATUS_LABELS.cancelled },
];

interface ProposalTableProps {
  proposals: Proposal[];
  /** `event` sütunu yerine `industry` göster (etkinlik detay sayfası). */
  variant?: 'dashboard' | 'event-detail';
  /** Durum güncellendiğinde üst bileşeni haberdar eder. */
  onStatusChange?: (proposal: Proposal) => void;
  emptyMessage?: string;
}

/**
 * Sponsorluk teklifleri tablosu.
 * Durum seçicisi optimistic olarak güncellenir; sunucu hata dönerse eski
 * değere geri alınır ve kullanıcıya toast ile bildirilir.
 */
export function ProposalTable({
  proposals,
  variant = 'dashboard',
  onStatusChange,
  emptyMessage = 'Henüz teklif bulunmuyor.',
}: ProposalTableProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rows, setRows] = useState<Proposal[]>(proposals);

  // `proposals` prop'u yeniden yüklendiğinde yerel kopyayı senkronla.
  const [lastProps, setLastProps] = useState(proposals);
  if (lastProps !== proposals) {
    setLastProps(proposals);
    setRows(proposals);
  }

  const columns =
    variant === 'event-detail'
      ? ([
          { key: 'sponsor', label: 'Sponsor Adı' },
          { key: 'industry', label: 'Sektör' },
          { key: 'budget', label: 'Teklif Bütçesi' },
          { key: 'score', label: 'AI Uyum Skoru' },
          { key: 'status', label: 'Durum' },
          { key: 'actions', label: 'İşlem', align: 'right' as const },
        ] as const)
      : ([
          { key: 'sponsor', label: 'Sponsor Adı' },
          { key: 'event', label: 'Hedef Etkinlik' },
          { key: 'budget', label: 'Bütçe' },
          { key: 'score', label: 'AI Skoru' },
          { key: 'status', label: 'Durum' },
          { key: 'actions', label: 'İşlem', align: 'right' as const },
        ] as const);

  async function handleStatusChange(proposal: Proposal, status: ProposalStatus) {
    const previous = proposal.status;

    // Optimistic güncelleme
    setRows((current) => current.map((row) => (row.id === proposal.id ? { ...row, status } : row)));
    setPendingId(proposal.id);

    try {
      const updated = await eventService.updateProposalStatus(proposal.id, status);
      setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      onStatusChange?.(updated);
      toast.success(
        `${proposal.sponsorName} teklifi "${PROPOSAL_STATUS_LABELS[status]}" olarak güncellendi.`,
      );
    } catch (error) {
      setRows((current) =>
        current.map((row) => (row.id === proposal.id ? { ...row, status: previous } : row)),
      );
      toast.error(
        error instanceof Error ? error.message : 'Durum güncellenemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Table>
      <TableHead columns={columns} />
      <TableBody>
        {rows.length === 0 ? (
          <TableEmpty colSpan={columns.length} message={emptyMessage} />
        ) : (
          rows.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-variant text-primary-container">
                    <Icon name={proposal.sponsorIcon || 'business'} size={18} />
                  </span>
                  <span className="font-medium text-primary">{proposal.sponsorName}</span>
                </div>
              </TableCell>

              {variant === 'event-detail' ? (
                <TableCell>
                  <Badge tone="primary">{proposal.sponsorIndustry}</Badge>
                </TableCell>
              ) : (
                <TableCell className="text-on-surface-variant">{proposal.eventName}</TableCell>
              )}

              <TableCell className="font-medium">{proposal.budgetLabel}</TableCell>

              <TableCell>
                <Badge
                  tone={variant === 'event-detail' ? 'info' : 'primary'}
                  icon="auto_awesome"
                  pill={variant === 'event-detail'}
                >
                  %{proposal.aiScore} Uyum
                </Badge>
              </TableCell>

              <TableCell>
                <InlineSelect
                  options={STATUS_OPTIONS}
                  value={proposal.status}
                  disabled={pendingId === proposal.id}
                  aria-label={`${proposal.sponsorName} teklif durumu`}
                  onChange={(e) => handleStatusChange(proposal, e.target.value as ProposalStatus)}
                />
              </TableCell>

              <TableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  <IconButton
                    icon="visibility"
                    label="Sponsoru görüntüle"
                    onClick={() => navigate(`/sponsor/profil/${proposal.sponsorId}`)}
                  />
                  <IconButton
                    icon="chat_bubble"
                    label="Mesaj gönder"
                    onClick={() => navigate('/organizator/mesajlar')}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
