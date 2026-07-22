import { createId } from "@paralleldrive/cuid2";
import { eq, ilike, or } from "drizzle-orm";
import { createDb } from "../packages/db/src/client";
import { contact, member, organization, user } from "../packages/db/src/schema/index";

const FIRST_NAMES = [
	"James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
	"William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
	"Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
	"Matthew", "Betty", "Anthony", "Sandra", "Mark", "Margaret", "Donald", "Ashley",
	"Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
	"Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa",
	"Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
	"Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
	"Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
	"Larry", "Pamela", "Justin", "Nicole", "Brandon", "Samantha", "Benjamin", "Katherine",
	"Samuel", "Christine", "Gregory", "Helen", "Alexander", "Debra", "Frank", "Rachel",
	"Patrick", "Carolyn", "Raymond", "Janet", "Jack", "Maria", "Dennis", "Heather",
	"Jerry", "Diane", "Tyler", "Virginia", "Aaron", "Julie", "Jose", "Joyce",
	"Adam", "Victoria", "Nathan", "Olivia", "Henry", "Kelly", "Zachary", "Christina",
	"Douglas", "Lauren", "Peter", "Joan", "Kyle", "Evelyn", "Noah", "Judith",
	"Ethan", "Megan", "Jeremy", "Cheryl", "Christian", "Andrea", "Walter", "Hannah"
];

const LAST_NAMES = [
	"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
	"Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
	"Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
	"Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
	"Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
	"Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
	"Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
	"Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
	"Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
	"Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
	"Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
	"Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers"
];

const DOMAINS = [
	"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
	"proton.me", "aol.com", "zoho.com", "fastmail.com", "me.com"
];

function generateContact(index: number) {
	const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
	const lastName = LAST_NAMES[(Math.floor(index / FIRST_NAMES.length) + index * 7) % LAST_NAMES.length];
	const domain = DOMAINS[index % DOMAINS.length];

	const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, "");
	const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, "");

	const formatChoice = index % 5;
	let emailPrefix: string;

	switch (formatChoice) {
		case 0:
			emailPrefix = `${cleanFirst}.${cleanLast}`;
			break;
		case 1:
			emailPrefix = `${cleanFirst}_${cleanLast}`;
			break;
		case 2:
			emailPrefix = `${cleanFirst}${cleanLast.charAt(0)}`;
			break;
		case 3:
			emailPrefix = `${cleanFirst.charAt(0)}.${cleanLast}`;
			break;
		default:
			emailPrefix = `${cleanFirst}.${cleanLast}`;
			break;
	}

	const uniqueEmail = index > 100 ? `${emailPrefix}${index}@${domain}` : `${emailPrefix}@${domain}`;

	return {
		firstName,
		lastName,
		email: uniqueEmail,
	};
}

function createShuffledStatuses(total: number, unsubscribedCount: number): ("subscribed" | "unsubscribed")[] {
	const statuses: ("subscribed" | "unsubscribed")[] = new Array(total);
	for (let i = 0; i < total; i++) {
		statuses[i] = i < unsubscribedCount ? "unsubscribed" : "subscribed";
	}

	// Fisher-Yates Shuffle algorithm
	for (let i = total - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = statuses[i];
		statuses[i] = statuses[j];
		statuses[j] = temp;
	}

	return statuses;
}

async function main() {
	const dbUrl =
		process.env.PG_URL ||
		"postgresql://reloop:reloop123@localhost:5432/reloop";

	console.log(`🔌 Connecting to database...`);
	const db = createDb({ databaseUrl: dbUrl });

	const TARGET_EMAIL = "reloop.sh@gmail.com";
	console.log(`🔍 Finding user with email "${TARGET_EMAIL}"...`);

	const [targetUser] = await db
		.select()
		.from(user)
		.where(ilike(user.email, TARGET_EMAIL));

	if (!targetUser) {
		console.error(`❌ User with email "${TARGET_EMAIL}" not found in database!`);
		process.exit(1);
	}

	console.log(`✅ Found user: ${targetUser.name} (${targetUser.id})`);

	// Find all matching haircare organizations
	const matchingOrgs = await db
		.select()
		.from(organization)
		.where(
			or(
				ilike(organization.name, "%haircare%"),
				ilike(organization.name, "%hair care%"),
				ilike(organization.slug, "%haircare%"),
				ilike(organization.slug, "%hair-care%")
			)
		);

	console.log(`✅ Found ${matchingOrgs.length} matching organization(s):`);
	for (const org of matchingOrgs) {
		console.log(`   - Org ID: ${org.id}, Name: "${org.name}", Slug: "${org.slug}"`);
	}

	// Make sure target user is a member of all matching organizations
	for (const org of matchingOrgs) {
		await db
			.insert(member)
			.values({
				id: `mem_${createId()}`,
				organizationId: org.id,
				userId: targetUser.id,
				role: "owner",
				createdAt: new Date(),
			})
			.onConflictDoNothing();
	}

	const TOTAL_CONTACTS = 15000;
	const UNSUBSCRIBED_COUNT = 3000;
	const SUBSCRIBED_COUNT = TOTAL_CONTACTS - UNSUBSCRIBED_COUNT; // 12,000

	for (const targetOrg of matchingOrgs) {
		console.log(`\n🧹 Cleaning old contacts for Org "${targetOrg.name}" (${targetOrg.id})...`);
		await db.delete(contact).where(eq(contact.organizationId, targetOrg.id));
		console.log(`✅ Old contacts deleted.`);

		console.log(`\n📦 Shuffling statuses (12,000 subscribed & 3,000 unsubscribed randomly distributed)...`);
		const shuffledStatuses = createShuffledStatuses(TOTAL_CONTACTS, UNSUBSCRIBED_COUNT);

		console.log(`📦 Inserting ${TOTAL_CONTACTS} realistic contacts with randomly shuffled statuses...`);

		const now = new Date();
		const batchSize = 1000;
		let insertedCount = 0;
		const startTime = Date.now();

		for (let i = 0; i < TOTAL_CONTACTS; i += batchSize) {
			const currentBatchSize = Math.min(batchSize, TOTAL_CONTACTS - i);
			const records = [];

			for (let j = 0; j < currentBatchSize; j++) {
				const index = i + j;
				const status = shuffledStatuses[index];
				const { firstName, lastName, email } = generateContact(index);

				records.push({
					id: `con_${createId()}`,
					email: email,
					status: status,
					organizationId: targetOrg.id,
					userId: targetUser.id,
					firstName: firstName,
					lastName: lastName,
					createdAt: now,
					updatedAt: now,
				});
			}

			await db.insert(contact).values(records).onConflictDoNothing();
			insertedCount += currentBatchSize;
			console.log(`   ⏳ Inserted ${insertedCount}/${TOTAL_CONTACTS} contacts...`);
		}

		const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
		console.log(`   🎉 Successfully inserted ${TOTAL_CONTACTS} realistic contacts into "${targetOrg.name}"! (${elapsedSeconds}s)`);
	}

	console.log("\n==========================================");
	console.log(`✅ REFRESH COMPLETE! 15,000 realistic contacts with shuffled statuses generated for reloop.sh@gmail.com.`);
	console.log("==========================================");

	process.exit(0);
}

main().catch((err) => {
	console.error("❌ Error generating realistic contacts:", err);
	process.exit(1);
});
