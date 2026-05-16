import { db } from '../db/client.js';
import { users, worlds, characters, loreEntries, memories, relationships, timelineEvents, chatSessions, chatMessages } from '../db/schema.js';

export async function seedData() {
  console.log('Seeding database...');

  // Clean existing data
  await db.delete(chatMessages);
  await db.delete(chatSessions);
  await db.delete(memories);
  await db.delete(relationships);
  await db.delete(timelineEvents);
  await db.delete(loreEntries);
  await db.delete(characters);
  await db.delete(worlds);
  await db.delete(users);

  // Seed user
  const [user] = await db.insert(users).values({
    name: 'Dungeon Master',
    email: 'dm@aethelgard.lore',
  }).returning();
  console.log(`Created user: ${user.name} (id=${user.id})`);

  // Seed world
  const [world] = await db.insert(worlds).values({
    name: 'Aethelgard',
    description: 'A medieval fantasy kingdom of court intrigue, ancient ruins, and simmering rebellion. The realm is bordered by the Wraithwood to the north and the Shattered Coast to the south.',
    genre: 'fantasy',
  }).returning();
  console.log(`Created world: ${world.name} (id=${world.id})`);

  // Seed characters
  const [c1] = await db.insert(characters).values({
    worldId: world.id,
    name: 'Lady Seraphina Blackwood',
    description: 'The youngest daughter of a disgraced noble house, trained as a spymaster by the Wraithwood elders. She moves through the court with calculated charm, concealing a network of informants beneath a mask of social disinterest.',
    personality: 'Calculating, fiercely loyal to her few confidants, dry sense of humor. She dislikes open conflict but excels at manipulating situations from the shadows. Prone to over-planning and rarely sleeps well.',
    role: 'spymaster',
    isPlayer: false,
  }).returning();

  const [c2] = await db.insert(characters).values({
    worldId: world.id,
    name: 'Sergeant Aldric Vane',
    description: 'A grizzled veteran of the Shattered Coast campaigns, now assigned as palace guard captain. His straightforward manner masks a deep guilt over actions taken during the Salt March.',
    personality: 'Direct, honorable to a fault, prone to drinking when memories surface. Surprisingly gentle with animals and children. Despises court politics but understands its necessity.',
    role: 'guard captain',
    isPlayer: false,
  }).returning();

  console.log(`Created characters: ${c1.name} (id=${c1.id}), ${c2.name} (id=${c2.id})`);

  // Seed relationship (Seraphina -> Aldric)
  const [rel] = await db.insert(relationships).values({
    fromCharacterId: c1.id,
    toCharacterId: c2.id,
    trust: 0.72,
    respect: 0.65,
    affection: 0.31,
    rivalry: 0.15,
    fear: 0.08,
    alignment: 0.58,
    notes: 'They share a mutual understanding born of witnessing the same atrocities during the Salt March cover-up. Seraphina respects Aldric\'s refusal to participate in palace schemes, while Aldric quietly protects her informants when he can.',
  }).returning();
  console.log(`Created relationship (id=${rel.id}): ${c1.name} -> ${c2.name}`);

  // Seed timeline events for Seraphina
  await db.insert(timelineEvents).values([
    {
      characterId: c1.id,
      title: 'Recruited by the Wraithwood Circle',
      description: 'At age fourteen, Seraphina was taken into the Wraithwood by the shadow-walker Maren after her father\'s execution. She spent six years learning the arts of observation, misdirection, and silent infiltration.',
      eventType: 'training',
      significance: 5,
      happenedAt: new Date('2008-03-15T00:00:00Z'),
    },
    {
      characterId: c1.id,
      title: 'Salt March Cover-Up',
      description: 'Witnessed the massacre of the Salt March protesters from the rooftops. The truth was buried by the royal council; she has spent years collecting evidence of who gave the order.',
      eventType: 'trauma',
      significance: 5,
      happenedAt: new Date('2016-09-22T00:00:00Z'),
    },
    {
      characterId: c1.id,
      title: 'Established the Silk Net informant ring',
      description: 'Built a network of servants, merchants, and minor nobles who feed her information from every quarter of the capital. The Silk Net now covers three districts and extends into the harbor guilds.',
      eventType: 'achievement',
      significance: 4,
      happenedAt: new Date('2019-01-10T00:00:00Z'),
    },
  ]);

  // Seed timeline events for Aldric
  await db.insert(timelineEvents).values([
    {
      characterId: c2.id,
      title: 'Battle of the Shattered Coast',
      description: 'Led a company that held the eastern bluffs for three days against pirate raiders. Lost his left ear and fourteen men. Was decorated by the crown but refused to speak of it afterward.',
      eventType: 'battle',
      significance: 4,
      happenedAt: new Date('2012-07-04T00:00:00Z'),
    },
    {
      characterId: c2.id,
      title: 'Salt March Refusal',
      description: 'Was ordered to open fire on unarmed protesters during the Salt March. He commanded his company to stand down and was demoted to palace guard duty as punishment.',
      eventType: 'moral crisis',
      significance: 5,
      happenedAt: new Date('2016-09-22T00:00:00Z'),
    },
    {
      characterId: c2.id,
      title: 'Guard Captain Appointment',
      description: 'After years of quiet competence, was promoted to captain of the palace guard following the suspicious death of his predecessor. He suspects the promotion was arranged by unseen hands.',
      eventType: 'appointment',
      significance: 3,
      happenedAt: new Date('2022-11-01T00:00:00Z'),
    },
  ]);

  // Seed memories for Seraphina
  await db.insert(memories).values([
    {
      characterId: c1.id,
      content: 'The smell of rain on the Wraithwood canopy. Maren taught me to read intentions in the set of a person\'s shoulders before I learned to read words on a page.',
      importance: 4.5,
      isActive: true,
    },
    {
      characterId: c1.id,
      content: 'During the Salt March, I saw Aldric refuse the order. His company stood at ease while others fired. That single moment is why I have never used what I know about him.',
      importance: 5.0,
      isActive: true,
    },
    {
      characterId: c1.id,
      content: 'The Silk Net cost me the last of my inheritance. I sold my mother\'s sapphire combs to fund the first three informants. I do not regret it, but I remember the weight of them in my palm.',
      importance: 3.5,
      isActive: true,
    },
  ]);

  // Seed memories for Aldric
  await db.insert(memories).values([
    {
      characterId: c2.id,
      content: 'The fourteenth man I lost at the Shattered Coast was called Tomas. He had a daughter who drew pictures of fish. I still send half my pay to her mother, though I have never met her.',
      importance: 4.5,
      isActive: true,
    },
    {
      characterId: c2.id,
      content: 'When I refused the Salt March order, Captain Drumm called me a coward in front of the company. I did not answer. He was found drowned in his wine three months later. I did not arrange it, but I did not mourn.',
      importance: 4.0,
      isActive: true,
    },
  ]);

  // Seed lore entries for Aethelgard
  await db.insert(loreEntries).values([
    {
      worldId: world.id,
      title: 'The Wraithwood',
      content: 'An ancient forest to the north of Aethelgard where the old orders still practice their arts. It is said the trees remember every promise ever made beneath their canopy. Few who enter alone return unchanged.',
      category: 'geography',
      tags: 'forest,magic,north',
    },
    {
      worldId: world.id,
      title: 'The Salt March',
      content: 'In 2016, commoners marched on the capital to protest salt taxes. The royal council ordered the guard to disperse them. The official record calls it a riot; survivors call it a massacre.',
      category: 'history',
      tags: 'history,politics,atrocity',
    },
    {
      worldId: world.id,
      title: 'The Shattered Coast',
      content: 'A fractured shoreline where pirate fleets harry merchant vessels and the crown maintains only a token presence. Local fishing villages have developed their own defense militias.',
      category: 'geography',
      tags: 'coast,pirates,military',
    },
  ]);
  console.log(`Created lore entries for world: ${world.name}`);

  // Seed chat session
  const [session] = await db.insert(chatSessions).values({
    worldId: world.id,
    characterId: c1.id,
    userId: user.id,
    title: 'First Encounter: The Silk Net',
    summary: 'The DM encounters Lady Seraphina Blackwood in the capital. She reveals the existence of the Silk Net and tests whether the newcomer can be trusted with information.',
  }).returning();
  console.log(`Created chat session: ${session.title} (id=${session.id})`);

  // Seed chat messages
  await db.insert(chatMessages).values([
    {
      sessionId: session.id,
      role: 'user',
      content: 'I am looking for someone who understands how the capital really works. Not the court poets—someone who sees the rot beneath the gilding.',
      metadata: { tone: 'earnest', intent: 'seek_ally' },
    },
    {
      sessionId: session.id,
      role: 'assistant',
      content: 'You speak as if the rot is hidden. It is not. It simply wears better clothes than the honest poor. What is it you need to know, and what are you willing to trade for it?',
      metadata: { mood: 'cautious', insight_level: 3 },
    },
    {
      sessionId: session.id,
      role: 'user',
      content: 'The Salt March. I need to know who gave the order to fire.',
      metadata: { tone: 'quiet', intent: 'investigate' },
    },
    {
      sessionId: session.id,
      role: 'assistant',
      content: 'That is a dangerous question to ask aloud. I have spent six years collecting answers to it. If you are serious, meet me at the Old Sailor\'s Rest at midnight. Come alone. Leave your steel at the door.',
      metadata: { mood: 'grave', insight_level: 5, trust_gauge: 0.2 },
    },
  ]);
  console.log(`Created chat messages for session id=${session.id}`);

  console.log('Seeding complete.');
}
