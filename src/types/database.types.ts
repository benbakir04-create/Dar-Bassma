// أنواع قاعدة البيانات - تُولَّد تلقائياً من Supabase
// قم بتحديثها بتشغيل: npx supabase gen types typescript --project-id YOUR_ID > src/types/database.types.ts

export type Database = {
  public: {
    Tables: {
      settings: {
        Row: { key: string; value: string; description: string | null };
        Insert: { key: string; value: string; description?: string | null };
        Update: { key?: string; value?: string; description?: string | null };
      };
      subjects: {
        Row: {
          id: string; name: string; name_en: string | null;
          icon: string | null; color_hex: string; text_color_hex: string;
          sort_order: number; active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["subjects"]["Row"], "sort_order"> & { sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
      };
      levels: {
        Row: {
          id: string; name: string; short_name: string | null;
          grade_number: number | null; stage: string | null;
          sort_order: number; active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["levels"]["Row"], "sort_order"> & { sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["levels"]["Row"]>;
      };
      books: {
        Row: {
          id: string; title: string; author: string | null;
          subject_id: string | null; level_id: string | null;
          isbn: string | null; serial_no: string | null;
          price: number; description: string | null;
          cover_emoji: string; cover_color: string;
          category: string | null; edition: string | null;
          publisher_year: number | null; active: boolean;
          created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["books"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["books"]["Insert"]>;
      };
      schools: {
        Row: {
          id: string; name: string; stage: string | null;
          city: string | null; address: string | null;
          contact_person: string | null; phone: string | null;
          email: string | null; registration_no: string | null;
          credit_limit: number; balance_due: number;
          notes: string | null; active: boolean; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schools"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["schools"]["Insert"]>;
      };
      users: {
        Row: {
          id: string; role: "admin" | "school" | "warehouse" | "delivery";
          linked_id: string | null; name: string; phone: string | null;
          active: boolean; approved: boolean;
          created_at: string; last_login: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string; school_id: string; created_by: string;
          order_date: string; status: OrderStatus;
          delivery_type: "delivery" | "pickup";
          driver_id: string | null; warehouse_user_id: string | null;
          notes: string | null; admin_notes: string | null;
          subtotal: number; tax_amount: number; total_amount: number;
          proforma_url: string | null; invoice_url: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "order_date" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string; order_id: string; book_id: string;
          quantity: number; unit_price: number;
          discount_pct: number; line_total: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };
      inventory: {
        Row: {
          book_id: string; quantity_available: number;
          quantity_reserved: number; quantity_delivered: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      order_status_log: {
        Row: {
          id: string; order_id: string;
          from_status: OrderStatus | null; to_status: OrderStatus;
          changed_by: string; timestamp: string; note: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["order_status_log"]["Row"], "id" | "timestamp">;
        Update: never;
      };
      inventory_log: {
        Row: {
          id: string; book_id: string; change_type: InventoryChangeType;
          quantity_change: number; order_id: string | null;
          performed_by: string; timestamp: string; note: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory_log"]["Row"], "id" | "timestamp">;
        Update: never;
      };
      packages: {
        Row: {
          id: string; name: string; level_id: string | null;
          price: number; active: boolean;
          created_at: string; updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["packages"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
      };
      package_books: {
        Row: {
          package_id: string; book_id: string; quantity: number;
        };
        Insert: Database["public"]["Tables"]["package_books"]["Row"];
        Update: Partial<Database["public"]["Tables"]["package_books"]["Insert"]>;
      };
    };
  };
};

export type OrderStatus =
  | "pending" | "approved" | "rejected"
  | "preparing" | "ready"
  | "out_for_delivery" | "delivered" | "cancelled";

export type InventoryChangeType =
  | "stock_in" | "reserve" | "unreserve"
  | "delivered" | "adjustment" | "damaged";

export type UserRole = "admin" | "school" | "warehouse" | "delivery";

// أنواع مشتقة للاستخدام في المكونات
export type Book    = Database["public"]["Tables"]["books"]["Row"];
export type School  = Database["public"]["Tables"]["schools"]["Row"];
export type Order   = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type User    = Database["public"]["Tables"]["users"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Level   = Database["public"]["Tables"]["levels"]["Row"];
export type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
export type Package = Database["public"]["Tables"]["packages"]["Row"];
export type PackageBook = Database["public"]["Tables"]["package_books"]["Row"];

// المستجيب الموحد من كل Server Action
export type ActionResponse<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; message: string };

// الطلب مع عناصره ومدرسته
export type OrderWithDetails = Order & {
  order_items: (OrderItem & { books: Book | null })[];
  schools: School | null;
  driver: User | null;
};

// عنصر السلة (Client-side)
export type CartItem = {
  book_id: string;
  title: string;
  price: number;
  quantity: number;
  cover_emoji: string;
};
