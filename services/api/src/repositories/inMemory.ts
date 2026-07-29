import type { Contact, PanicEvent, PanicNotification, User } from '../domain/types';

/**
 * Repositórios em memória do MVP.
 *
 * TODO (épico E7 do backlog): substituir por Prisma + PostgreSQL mantendo estas
 * interfaces. Os services dependem apenas dos contratos abaixo, então a troca de
 * persistência não deve tocar em regra de negócio.
 */

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export interface ContactRepository {
  create(contact: Contact): Promise<Contact>;
  findById(id: string): Promise<Contact | null>;
  listByUser(userId: string): Promise<Contact[]>;
  listVerifiedByUser(userId: string): Promise<Contact[]>;
  countByUser(userId: string): Promise<number>;
  update(contact: Contact): Promise<Contact>;
  isBlocked(destinationHash: string): Promise<boolean>;
  block(destinationHash: string): Promise<void>;
}

export interface PanicRepository {
  createEvent(event: PanicEvent): Promise<PanicEvent>;
  findEventById(id: string): Promise<PanicEvent | null>;
  findEventByIdempotencyKey(userId: string, key: string): Promise<PanicEvent | null>;
  updateEvent(event: PanicEvent): Promise<PanicEvent>;
  listEventsByUser(userId: string): Promise<PanicEvent[]>;
  createNotification(notification: PanicNotification): Promise<PanicNotification>;
  updateNotification(notification: PanicNotification): Promise<PanicNotification>;
  listNotificationsByEvent(eventId: string): Promise<PanicNotification[]>;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user && !user.deletedAt ? user : null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}

export class InMemoryContactRepository implements ContactRepository {
  private readonly contacts = new Map<string, Contact>();
  /** Lista de bloqueio permanente por destino (opt-out). Ver PANIC_BUTTON_DESIGN.md §3.3. */
  private readonly blocklist = new Set<string>();

  async create(contact: Contact): Promise<Contact> {
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async findById(id: string): Promise<Contact | null> {
    return this.contacts.get(id) ?? null;
  }

  async listByUser(userId: string): Promise<Contact[]> {
    return [...this.contacts.values()]
      .filter((c) => c.userId === userId && c.status !== 'revoked')
      .sort((a, b) => a.priority - b.priority);
  }

  async listVerifiedByUser(userId: string): Promise<Contact[]> {
    return (await this.listByUser(userId)).filter((c) => c.status === 'verified');
  }

  async countByUser(userId: string): Promise<number> {
    return (await this.listByUser(userId)).length;
  }

  async update(contact: Contact): Promise<Contact> {
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async isBlocked(destinationHash: string): Promise<boolean> {
    return this.blocklist.has(destinationHash);
  }

  async block(destinationHash: string): Promise<void> {
    this.blocklist.add(destinationHash);
  }
}

export class InMemoryPanicRepository implements PanicRepository {
  private readonly events = new Map<string, PanicEvent>();
  private readonly notifications = new Map<string, PanicNotification>();

  async createEvent(event: PanicEvent): Promise<PanicEvent> {
    this.events.set(event.id, event);
    return event;
  }

  async findEventById(id: string): Promise<PanicEvent | null> {
    return this.events.get(id) ?? null;
  }

  async findEventByIdempotencyKey(userId: string, key: string): Promise<PanicEvent | null> {
    return (
      [...this.events.values()].find((e) => e.userId === userId && e.idempotencyKey === key) ?? null
    );
  }

  async updateEvent(event: PanicEvent): Promise<PanicEvent> {
    this.events.set(event.id, event);
    return event;
  }

  async listEventsByUser(userId: string): Promise<PanicEvent[]> {
    return [...this.events.values()]
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createNotification(notification: PanicNotification): Promise<PanicNotification> {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async updateNotification(notification: PanicNotification): Promise<PanicNotification> {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async listNotificationsByEvent(eventId: string): Promise<PanicNotification[]> {
    return [...this.notifications.values()].filter((n) => n.panicEventId === eventId);
  }
}
