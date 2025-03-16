import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscanCount?: number;
  maxHeight?: number | string;
}

/**
 * A virtualized list component that efficiently renders only the visible items
 * Improves performance for long lists by reducing DOM nodes
 */
function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscanCount = 5,
  maxHeight = '70vh'
}: VirtualizedListProps<T>) {
  // Row renderer function for react-window
  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <Box width="100%" height={maxHeight}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Box>
  );
}

export default VirtualizedList;
