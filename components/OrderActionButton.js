import React from 'react';

import { STATUS_ACTION_LABELS, NEXT_STATUS } from '../lib/constants';
import Button from './ui/Button';

/**
 * Status-specific action button for order detail screen.
 *
 * Displays the appropriate next-status action based on the current order status.
 * - PLACED → "Mark as Packed" (green)
 * - PACKED → "Out for Delivery" (green)
 * - OUT_FOR_DELIVERY → "Mark Delivered" (green)
 * - DELIVERED → "Completed" (disabled, gray)
 *
 * @param {object}   props
 * @param {string}   props.status   - Current order status
 * @param {function} props.onPress  - Called when the action button is pressed
 * @param {boolean}  [props.loading] - Shows spinner
 */
export default function OrderActionButton({ status, onPress, loading = false }) {
  const label = STATUS_ACTION_LABELS[status] || 'No Action';
  const nextStatus = NEXT_STATUS[status];
  const isCompleted = status === 'DELIVERED' || status === 'CANCELLED';

  return (
    <Button
      title={label}
      onPress={() => onPress(nextStatus)}
      loading={loading}
      disabled={isCompleted}
      variant={isCompleted ? 'secondary' : 'primary'}
    />
  );
}
