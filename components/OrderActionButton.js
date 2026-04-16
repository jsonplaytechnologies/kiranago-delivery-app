import React from 'react';

import { STATUS_ACTION_LABELS, NEXT_STATUS } from '../lib/constants';
import Button from './ui/Button';

/**
 * Status-specific action button for order detail screen.
 *
 * - PLACED:            "Mark as Packed"  — primary green, cube-outline icon
 * - PACKED:            "Out for Delivery" — accent orange, bicycle-outline icon
 * - OUT_FOR_DELIVERY:  "Mark Delivered"  — success green, checkmark-circle-outline icon
 * - DELIVERED:         "Completed"       — disabled neutral, checkmark-done-outline icon
 */

const STATUS_CONFIG = {
  PLACED: {
    variant: 'primary',
    icon: 'cube-outline',
  },
  PACKED: {
    variant: 'accent',
    icon: 'bicycle-outline',
  },
  OUT_FOR_DELIVERY: {
    variant: 'success',
    icon: 'checkmark-circle-outline',
  },
  DELIVERED: {
    variant: 'disabled',
    icon: 'checkmark-done-outline',
  },
  CANCELLED: {
    variant: 'disabled',
    icon: 'close-circle-outline',
  },
};

export default function OrderActionButton({ status, onPress, loading = false }) {
  const label = STATUS_ACTION_LABELS[status] || 'No Action';
  const nextStatus = NEXT_STATUS[status];
  const isCompleted = status === 'DELIVERED' || status === 'CANCELLED';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DELIVERED;

  return (
    <Button
      title={label}
      onPress={() => onPress(nextStatus)}
      loading={loading}
      disabled={isCompleted}
      variant={config.variant}
      icon={config.icon}
    />
  );
}
