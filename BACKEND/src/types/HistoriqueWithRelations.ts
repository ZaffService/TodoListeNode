export type HistoriqueWithRelations = {
    id: number; userId: number; tacheId: number;
  modifiedAt: Date;
  user: { nom: string };
  taches: { createAt: Date };
};