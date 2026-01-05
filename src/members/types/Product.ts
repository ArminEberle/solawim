export enum Product {
    FLEISCH = 'fleisch',
    MILCH = 'milch',
    BROT = 'brot',
    VEGGIE = 'veggie',
}

export enum DeliverableProduct {
    FLEISCH = 'deliverable_fleisch',
    MILCH = 'deliverable_milch',
    JOGHURT = 'deliverable_joghurt',
    HARTKAESE = 'deliverable_hartkaese',
    MILCH_EXTRA = 'deliverable_extra',
    BROT = 'deliverable_brot',
    VEGGIE = 'deliverable_veggie',
}

export const deliverableProductToLabelMap: Record<DeliverableProduct, string> = {
    [DeliverableProduct.FLEISCH]: 'Fleisch',
    [DeliverableProduct.MILCH]: 'Milch',
    [DeliverableProduct.JOGHURT]: 'Milchanteil Joghurt',
    [DeliverableProduct.HARTKAESE]: 'Milchanteil Hart-/Schnittkäse',
    [DeliverableProduct.MILCH_EXTRA]: 'Milchanteil-Extra (Sahne, Quark, etc.)',
    [DeliverableProduct.BROT]: 'Brotanteil',
    [DeliverableProduct.VEGGIE]: 'Gemüseanteil',
};
