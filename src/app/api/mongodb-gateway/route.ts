import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { action, collection: collectionName, filter = {}, data = {}, options = {} } = await req.json();

    if (!collectionName) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection(collectionName);

    const safeFilter = filter || {};
    const safeData = data || {};

    if (safeFilter._id && typeof safeFilter._id === 'string' && ObjectId.isValid(safeFilter._id)) {
      safeFilter._id = new ObjectId(safeFilter._id);
    }
    if (safeData._id && typeof safeData._id === 'string' && ObjectId.isValid(safeData._id)) {
      safeData._id = new ObjectId(safeData._id);
    }

    let result: any = null;

    switch (action) {
      case 'find':
        const cursor = collection.find(safeFilter);
        if (options.sort) cursor.sort(options.sort);
        if (options.limit) cursor.limit(options.limit);
        if (options.skip) cursor.skip(options.skip);
        result = await cursor.toArray();
        break;

      case 'findOne':
        result = await collection.findOne(safeFilter);
        break;

      case 'insertOne':
        const insertRes = await collection.insertOne(safeData);
        result = { ...safeData, _id: insertRes.insertedId };
        break;

      case 'updateOne':
        const updateRes = await collection.updateOne(safeFilter, { $set: safeData }, options);
        result = { matchedCount: updateRes.matchedCount, modifiedCount: updateRes.modifiedCount };
        break;

      case 'upsert':
        const upsertRes = await collection.updateOne(
          safeFilter,
          { $set: safeData },
          { upsert: true }
        );
        result = { matchedCount: upsertRes.matchedCount, modifiedCount: upsertRes.modifiedCount, upsertedId: upsertRes.upsertedId };
        break;

      case 'deleteOne':
        const deleteRes = await collection.deleteOne(safeFilter);
        result = { deletedCount: deleteRes.deletedCount };
        break;

      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error('[MONGODB GATEWAY ERROR]', error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
