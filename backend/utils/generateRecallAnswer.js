/**
 * Generates suggested answers for flashcards based on problem patterns and difficulty.
 * @param {Object} problem - The problem document from MongoDB.
 * @returns {Object} - Suggested dataStructure, timeComplexity, and keyAlgorithmIdea.
 */
const generateRecallAnswer = (problem) => {
    const topics = problem.topics || [];
    const difficulty = problem.difficulty || 'Medium';
    const category = problem.category || '';

    // 1. Priority mappings for patterns
    const patternMappings = {
        'Hash Map': {
            ds: 'Hash Map / Unordered Map',
            tc: 'O(n)',
            idea: 'Store previously seen values in a map and check if the complement (target - current) exists.'
        },
        'Two Pointers': {
            ds: 'Two Pointers',
            tc: 'O(n)',
            idea: 'Move two pointers (usually from ends or together) to satisfy a specific condition or find a range.'
        },
        'Sliding Window': {
            ds: 'Window + Array/String',
            tc: 'O(n)',
            idea: 'Maintain a moving window and expand/shrink it while maintaining constraints to find optimal subsegments.'
        },
        'Binary Search': {
            ds: 'Sorted Array + Two Pointers',
            tc: 'O(log n)',
            idea: 'Repeatedly divide the search space in half by comparing the middle element with the target.'
        },
        'Trie': {
            ds: 'Trie (Prefix Tree)',
            tc: 'O(L) where L is the length of the string',
            idea: 'Store characters at tree nodes to provide efficient prefix-based searching and insertions.'
        },
        'Union Find': {
            ds: 'Disjoint Set Union (DSU)',
            tc: 'O(α(n)) near constant time',
            idea: 'Maintain disjoint sets and use path compression and union by rank for efficient connectivity checks.'
        },
        'Backtracking': {
            ds: 'Recursion Stack + State Tracking',
            tc: 'O(K^n)',
            idea: 'Systematically explore all possible configurations and "backtrack" when a configuration fails to meet constraints.'
        }
    };

    // 2. Category based mapping (Primary Data Structure)
    const categoryMappings = {
        'Linked List': {
            ds: 'Single/Double Linked List',
            tc: 'O(n)',
            idea: 'Manipulate node pointers (next/prev) to traverse, reverse, or modify the sequence.'
        },
        'Tree': {
            ds: 'Binary Tree / BST',
            tc: 'O(n)',
            idea: 'Traverse the hierarchy using Depth-First Search (DFS) or Breadth-First Search (BFS).'
        },
        'Graph': {
            ds: 'Adjacency List / Matrix',
            tc: 'O(V + E)',
            idea: 'Represent relationships as nodes and edges, using BFS/DFS for traversal and connectivity.'
        },
        'Heap': {
            ds: 'Priority Queue (Min/Max Heap)',
            tc: 'O(n log n)',
            idea: 'Use a binary heap to efficiently find the K-th smallest/largest element or maintain sorted order.'
        },
        'Stack': {
            ds: 'Stack (LIFO)',
            tc: 'O(n)',
            idea: 'Use Last-In-First-Out logic for nested structures, matching brackets, or monotonic trends.'
        },
        'Queue': {
            ds: 'Queue (FIFO)',
            tc: 'O(n)',
            idea: 'Use First-In-First-Out logic, typically for BFS or level-order processing.'
        },
        'DP': {
            ds: '1D/2D DP Table',
            tc: 'O(n*m)',
            idea: 'Break down into overlapping subproblems and store results to avoid redundant work.'
        },
        'Array': {
            ds: 'Array / Dynamic Array',
            tc: 'O(n)',
            idea: 'Use indexing and loops to process elements in a linear sequence.'
        },
        'String': {
            ds: 'String / Character Array',
            tc: 'O(n)',
            idea: 'Process sequences of characters, often using sliding windows or frequency maps.'
        }
    };

    // Check Priority 1: Pattern (for TC and Idea)
    let patternMatch = null;
    for (const topic of topics) {
        if (patternMappings[topic]) {
            patternMatch = patternMappings[topic];
            break;
        }
    }

    // Check Priority 2: Category (for DS)
    const categoryMatch = category && categoryMappings[category] ? categoryMappings[category] : null;

    // Define Fallback (Difficulty)
    const fallbacks = {
        'Easy': { ds: 'Hash Map or Two Pointers', tc: 'O(n)', idea: 'Linear pass with simple memory.' },
        'Medium': { ds: 'Sliding Window or Binary Search', tc: 'O(n)', idea: 'Optimal subarray search or divide & conquer.' },
        'Hard': { ds: 'DP / Advanced Graph', tc: 'O(n^2)', idea: 'Complex state transitions or graph algorithms.' }
    };
    const difficultyFallback = fallbacks[difficulty] || fallbacks['Medium'];

    // Construct Result
    return {
        // DS Priority: Category > Pattern > Fallback
        ds: category || (patternMatch ? patternMatch.ds : difficultyFallback.ds),
        
        // TC/Idea Priority: Pattern > Category > Fallback
        tc: patternMatch ? patternMatch.tc : (categoryMatch ? categoryMatch.tc : difficultyFallback.tc),
        idea: patternMatch ? patternMatch.idea : (categoryMatch ? categoryMatch.idea : difficultyFallback.idea)
    };
};

module.exports = generateRecallAnswer;
