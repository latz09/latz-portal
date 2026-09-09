// app/api/projects/[id]/journey/route.js
import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';

const ALLOWED_STATUSES = ['todo', 'in-progress', 'waiting', 'done'];
const ALLOWED_WAITING_ON = ['client', 'designer', 'other'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== 'internal') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { stepKey, status, waitingOn, derivedFrom, dateOverride, dueDate } = await req.json();

  if (!stepKey) {
    return Response.json({ error: 'Missing stepKey' }, { status: 400 });
  }

  const path = (field) => `journeySteps[_key=="${stepKey}"].${field}`;

  // Due-date-only edit — milestone target date, independent of status.
  // Frontend omits `status` entirely for this call.
  if (status === undefined) {
    if (dueDate === undefined) {
      return Response.json({ error: 'Nothing to update' }, { status: 400 });
    }
    const patch = dueDate
      ? writeClient.patch(id).set({ [path('dueDate')]: dueDate })
      : writeClient.patch(id).unset([path('dueDate')]);
    await patch.commit();
    return Response.json({ success: true });
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }
  if (waitingOn && !ALLOWED_WAITING_ON.includes(waitingOn)) {
    return Response.json({ error: 'Invalid waitingOn' }, { status: 400 });
  }

  // dateOverride lets a status-change call also correct the date
  // (e.g. re-saving "done" with a date from 2 days ago) instead of
  // always stamping today.
  const date = dateOverride || today();
  let patch = writeClient.patch(id).set({ [path('status')]: status });
  const unsetPaths = [];

  if (status === 'waiting') {
    patch = patch.set({
      [path('waitingOn')]: waitingOn || null,
      [path('enteredWaitingAt')]: date,
    });
    unsetPaths.push(path('completedAt'));
  } else if (status === 'done') {
    patch = patch.set({ [path('completedAt')]: date });
    unsetPaths.push(path('waitingOn'), path('enteredWaitingAt'));
  } else {
    unsetPaths.push(path('waitingOn'), path('enteredWaitingAt'), path('completedAt'));
  }

  if (derivedFrom === 'deposit' || derivedFrom === 'final') {
    const paidField = derivedFrom === 'deposit' ? 'depositPaid' : 'finalPaid';
    const dateField = derivedFrom === 'deposit' ? 'depositPaidDate' : 'finalPaidDate';
    if (status === 'done') {
      patch = patch.set({
        [`clientPayment.${paidField}`]: true,
        [`clientPayment.${dateField}`]: date,
      });
    } else {
      patch = patch.set({ [`clientPayment.${paidField}`]: false });
      unsetPaths.push(`clientPayment.${dateField}`);
    }
  }

  // Optional: a status-change call can also carry a dueDate update in the
  // same request/commit, though the frontend currently sends these separately.
  if (dueDate !== undefined) {
    if (dueDate) patch = patch.set({ [path('dueDate')]: dueDate });
    else unsetPaths.push(path('dueDate'));
  }

  if (unsetPaths.length) patch = patch.unset(unsetPaths);

  await patch.commit();

  return Response.json({ success: true });
}