export type Conversation = {
  id: string;
  preview: string;
  time: string;
  initials: string;
  active: boolean;
  unreadCount?: number;
  waiting?: boolean;
};

export type ChatMessage = {
  id: string;
  status?: "accepted" | "sent" | "delivered" | "read" | "failed";
  type:
    | "date"
    | "system"
    | "outgoing-file"
    | "outgoing-audio"
    | "outgoing"
    | "incoming";
  text: string;
  time: string;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  pageCount?: number;
};

export const conversations: Conversation[] = [
  {
    id: "932889985",
    preview: "hola",
    time: "07/05",
    initials: "CL",
    active: true,
  },
  {
    id: "51987654321",
    preview: "hola cuanto esta el modelo de esta ropa? pregunten precios por favor",
    time: "10:30",
    initials: "JC",
    active: false,
    waiting: true,
  },
  {
    id: "51923456789",
    preview: "buenas tardes, tienen casacas de cuero?",
    time: "11:15",
    initials: "MR",
    active: false,
    waiting: true,
  },
  {
    id: "51987612345",
    preview: "cuanto cuesta el pantalon jean azul talla 32?",
    time: "12:00",
    initials: "LP",
    active: false,
    waiting: true,
  },
  {
    id: "51934567890",
    preview: "hola me interesa el modelo de camisa blanca, tienen stock?",
    time: "13:45",
    initials: "AV",
    active: false,
    waiting: true,
  },
  {
    id: "51956789012",
    preview: "vi su pagina en tiktok, cuanto esta la polera estampada?",
    time: "14:20",
    initials: "DG",
    active: false,
    waiting: true,
  },
  {
    id: "51978901234",
    preview: "de facebook, tienen delivery a provincia? precio de zapatillas nike",
    time: "15:10",
    initials: "RS",
    active: false,
    waiting: true,
  },
];

export const initialMessagesByConversation: Record<string, ChatMessage[]> = {
  "932889985": [
    {
      id: "date-1",
      type: "date",
      text: "Ayer",
      time: "",
    },
    {
      id: "system-1",
      type: "system",
      text: "Crhis Leonel ha resuelto la conversacion",
      time: "12:33",
    },
    {
      id: "system-2",
      type: "system",
      text: "Cristofer Leonardo ha reabierto la conversacion",
      time: "12:34",
    },
    {
      id: "system-3",
      type: "system",
      text: "Cristofer Leonardo ha resuelto la conversacion",
      time: "12:34",
    },
    {
      id: "system-4",
      type: "system",
      text: "Cristofer Leonardo ha reabierto la conversacion",
      time: "12:35",
    },
    {
      id: "date-2",
      type: "date",
      text: "Hoy",
      time: "",
    },
    {
      id: "file-1",
      type: "outgoing-file",
      text: "CATALOGO.PDF",
      time: "14:17",
    },
    {
      id: "out-1",
      type: "outgoing",
      text: "HOLA",
      time: "15:48",
    },
    {
      id: "out-2",
      type: "outgoing",
      text: "hola",
      time: "15:48",
    },
    {
      id: "out-3",
      type: "outgoing",
      text: "hola",
      time: "15:48",
    },
    {
      id: "in-1",
      type: "incoming",
      text: "hola",
      time: "15:50",
    },
  ],
  "51987654321": [
    {
      id: "date-1-w",
      type: "date",
      text: "Hoy",
      time: "",
    },
    {
      id: "in-w1",
      type: "incoming",
      text: "hola cuanto esta el modelo de esta ropa? pregunten precios por favor",
      time: "10:30",
    },
  ],
  "51923456789": [
    {
      id: "date-2-w",
      type: "date",
      text: "Hoy",
      time: "",
    },
    {
      id: "in-w2",
      type: "incoming",
      text: "buenas tardes, tienen casacas de cuero?",
      time: "11:15",
    },
  ],
  "51987612345": [
    {
      id: "date-3-w",
      type: "date",
      text: "Hoy",
      time: "",
    },
    {
      id: "in-w3",
      type: "incoming",
      text: "cuanto cuesta el pantalon jean azul talla 32?",
      time: "12:00",
    },
  ],
  "51934567890": [
    {
      id: "date-4-w",
      type: "date",
      text: "Hoy",
      time: "",
    },
    {
      id: "in-w4",
      type: "incoming",
      text: "hola me interesa el modelo de camisa blanca, tienen stock?",
      time: "13:45",
    },
  ],
  "51956789012": [
    {
      id: "date-5-w",
      type: "date",
      text: "Hoy",
      time: "",
    },
    {
      id: "in-w5",
      type: "incoming",
      text: "vi su pagina en tiktok, cuanto esta la polera estampada?",
      time: "14:20",
    },
  ],
  "51978901234": [
    {
      id: "date-6-w",
      type: "date",
      text: "Hoy",
      time: "",
    },
    {
      id: "in-w6",
      type: "incoming",
      text: "de facebook, tienen delivery a provincia? precio de zapatillas nike",
      time: "15:10",
    },
  ],
};

export const initialTimeline: ChatMessage[] = initialMessagesByConversation["932889985"];
