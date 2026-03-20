export type ProductCondition = "excelente" | "buena" | "vintage";

export type ProductCategory =
  | "ropa"
  | "intimo-hogar"
  | "accesorios"
  | "especial";

export type ProductSubcategory =
  // ropa
  | "vestidos"
  | "tops"
  | "pantalones-faldas"
  | "abrigos"
  | "conjuntos-especiales"
  // intimo-hogar
  | "lenceria"
  | "pijamas"
  | "ropa-de-bano"
  | "fajas"
  // accesorios
  | "bolsos-billeteras"
  | "zapatos"
  | "bufandas-correas"
  | "articulos-varios"
  // especial
  | "ninos"
  | "regaladas"
  | "ropa-de-verano";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "única";
export type OrderStatus = "pendiente" | "pagado" | "enviado";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  size: ProductSize;
  condition: ProductCondition;
  images: string[];
  in_stock: boolean;
  reference?: string | null;
  created_at: string;
  user_id?: string | null;
}

export interface Profile {
  id: string;
  role: "admin" | "user";
  full_name: string | null;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: 1; // siempre 1 unidad por producto
}

export interface ShippingAddress {
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  notas?: string;
}

export interface Order {
  id: string;
  customer_email: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  mercadopago_preference_id: string | null;
  mercadopago_payment_id: string | null;
  created_at: string;
}
