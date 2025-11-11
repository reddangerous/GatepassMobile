import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  loading?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false
}) => {
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const pageSizeOptions = [10, 20, 50, 100];

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key={1}
          style={[styles.pageButton, currentPage === 1 && styles.activePageButton]}
          onPress={() => onPageChange(1)}
          disabled={loading}
        >
          <Text style={[styles.pageButtonText, currentPage === 1 && styles.activePageButtonText]}>
            1
          </Text>
        </TouchableOpacity>
      );
      
      if (startPage > 2) {
        pages.push(
          <Text key="ellipsis1" style={styles.ellipsis}>...</Text>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[styles.pageButton, currentPage === i && styles.activePageButton]}
          onPress={() => onPageChange(i)}
          disabled={loading}
        >
          <Text style={[styles.pageButtonText, currentPage === i && styles.activePageButtonText]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="ellipsis2" style={styles.ellipsis}>...</Text>
        );
      }
      
      pages.push(
        <TouchableOpacity
          key={totalPages}
          style={[styles.pageButton, currentPage === totalPages && styles.activePageButton]}
          onPress={() => onPageChange(totalPages)}
          disabled={loading}
        >
          <Text style={[styles.pageButtonText, currentPage === totalPages && styles.activePageButtonText]}>
            {totalPages}
          </Text>
        </TouchableOpacity>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {startRecord}-{endRecord} of {totalRecords}
        </Text>
        
        {onPageSizeChange && (
          <View style={styles.pageSizeContainer}>
            <Text style={styles.pageSizeLabel}>Show:</Text>
            <View style={styles.pageSizeOptions}>
              {pageSizeOptions.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.pageSizeButton,
                    pageSize === size && styles.activePageSizeButton
                  ]}
                  onPress={() => onPageSizeChange(size)}
                  disabled={loading}
                >
                  <Text style={[
                    styles.pageSizeButtonText,
                    pageSize === size && styles.activePageSizeButtonText
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 1 && styles.disabledNavButton]}
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          <ChevronLeft size={20} color={currentPage === 1 ? '#ccc' : '#007AFF'} />
        </TouchableOpacity>

        <View style={styles.pageNumbersContainer}>
          {renderPageNumbers()}
        </View>

        <TouchableOpacity
          style={[styles.navButton, currentPage === totalPages && styles.disabledNavButton]}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          <ChevronRight size={20} color={currentPage === totalPages ? '#ccc' : '#007AFF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  pageSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageSizeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  pageSizeOptions: {
    flexDirection: 'row',
  },
  pageSizeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activePageSizeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pageSizeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  activePageSizeButtonText: {
    color: '#fff',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
  },
  disabledNavButton: {
    backgroundColor: '#f9f9f9',
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    minWidth: 36,
    alignItems: 'center',
  },
  activePageButton: {
    backgroundColor: '#007AFF',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activePageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ellipsis: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
});

export default PaginationControls;