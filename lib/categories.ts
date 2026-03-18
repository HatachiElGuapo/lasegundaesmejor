import type { ProductCategory, ProductSubcategory } from '@/types';

export interface SubcategoryOption {
  value: ProductSubcategory;
  label: string;
}

export interface CategoryOption {
  value: ProductCategory;
  label: string;
  subcategories: SubcategoryOption[];
}

export const CATEGORY_TREE: CategoryOption[] = [
  {
    value: 'ropa',
    label: 'Ropa',
    subcategories: [
      { value: 'vestidos',             label: 'Vestidos'             },
      { value: 'tops',                 label: 'Tops'                 },
      { value: 'pantalones-faldas',    label: 'Pantalones y faldas'  },
      { value: 'abrigos',              label: 'Abrigos'              },
      { value: 'conjuntos-especiales', label: 'Conjuntos especiales' },
    ],
  },
  {
    value: 'intimo-hogar',
    label: 'Íntimo y Hogar',
    subcategories: [
      { value: 'lenceria',     label: 'Lencería'      },
      { value: 'pijamas',      label: 'Pijamas'       },
      { value: 'ropa-de-bano', label: 'Ropa de baño'  },
      { value: 'fajas',        label: 'Fajas'         },
    ],
  },
  {
    value: 'accesorios',
    label: 'Accesorios',
    subcategories: [
      { value: 'bolsos-billeteras', label: 'Bolsos y billeteras' },
      { value: 'zapatos',           label: 'Zapatos'             },
      { value: 'bufandas-correas',  label: 'Bufandas y correas'  },
      { value: 'articulos-varios',  label: 'Artículos varios'    },
    ],
  },
  {
    value: 'especial',
    label: 'Especial',
    subcategories: [
      { value: 'ninos',          label: 'Niños'          },
      { value: 'regaladas',      label: 'Regaladas'      },
      { value: 'ropa-de-verano', label: 'Ropa de verano' },
    ],
  },
];
