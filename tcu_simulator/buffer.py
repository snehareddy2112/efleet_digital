"""
TCU Store-and-Forward Telemetry Buffer
Provides offline packet queuing, persistent capacity limits, and ordered replay when cellular connection returns.
"""

from typing import List, Dict, Any, Optional
import collections
import threading

class TCUBuffer:
    def __init__(self, max_capacity: int = 10000):
        self.max_capacity = max_capacity
        self._buffer: collections.deque = collections.deque(maxlen=max_capacity)
        self._lock = threading.Lock()
        self.total_buffered_packets = 0
        self.total_flushed_packets = 0
        self.dropped_packets = 0

    def push(self, packet: Dict[str, Any]) -> bool:
        """Pushes a telemetry packet to the offline buffer"""
        with self._lock:
            if len(self._buffer) >= self.max_capacity:
                self.dropped_packets += 1
            self._buffer.append(packet)
            self.total_buffered_packets += 1
            return True

    def pop_batch(self, batch_size: int = 50) -> List[Dict[str, Any]]:
        """Pops a batch of queued packets in chronological FIFO order"""
        batch = []
        with self._lock:
            while self._buffer and len(batch) < batch_size:
                batch.append(self._buffer.popleft())
            self.total_flushed_packets += len(batch)
        return batch

    def peek(self) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self._buffer[0] if self._buffer else None

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._buffer)

    def is_empty(self) -> bool:
        with self._lock:
            return len(self._buffer) == 0

    def clear(self):
        with self._lock:
            self._buffer.clear()
