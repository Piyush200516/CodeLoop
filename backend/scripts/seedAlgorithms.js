const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Algorithm = require('../models/Algorithm');

dotenv.config({ path: path.join(__dirname, '../.env') });

const allAlgorithms = [
    // --- Array Patterns ---
    {
        name: 'two-pointer', title: 'Two Pointer', category: 'Array Patterns',
        explanation: 'Uses two markers to iterate through a data structure constraints-fast.',
        exampleProblem: { title: 'Two Sum II', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
        steps: [
            { label: 'Initialize Pointers', description: 'Set left pointer at start, right pointer at end.' },
            { label: 'Check Condition', description: 'If sum matches target, return indices.' },
            { label: 'Move Pointers', description: 'If sum < target, left++; if sum > target, right--.' }
        ]
    },
    {
        name: 'sliding-window', title: 'Sliding Window', category: 'Array Patterns',
        explanation: 'Creates a window over a data structure to analyze subsets of data.',
        exampleProblem: { title: 'Maximum Subarray Sum', url: 'https://leetcode.com/problems/maximum-subarray/' },
        steps: [
            { label: 'Expand Window', description: 'Move the right pointer to expand the window.' },
            { label: 'Check Validity', description: 'If window condition is violated, move left pointer to shrink.' },
            { label: 'Update Max/Min', description: 'Record the best window size found.' }
        ]
    },
    {
        name: 'prefix-sum', title: 'Prefix Sum', category: 'Array Patterns',
        explanation: 'Precomputes cumulative sums of an array to answer range queries in O(1) time.',
        exampleProblem: { title: 'Range Sum Query - Immutable', url: 'https://leetcode.com/problems/range-sum-query-immutable/' },
        steps: [
            { label: 'Initialize Prefix Array', description: 'Create an array of same length + 1.' },
            { label: 'Compute Sums', description: 'prefix[i] = prefix[i-1] + nums[i-1].' },
            { label: 'Query Range', description: 'Sum from L to R is prefix[R+1] - prefix[L].' }
        ]
    },
    {
        name: 'cyclic-sort', title: 'Cyclic Sort', category: 'Array Patterns',
        explanation: 'Useful for finding missing numbers when numbers are in a given range (e.g., 1 to n).',
        exampleProblem: { title: 'Missing Number', url: 'https://leetcode.com/problems/missing-number/' },
        steps: [
            { label: 'Check Index', description: 'Is current number at its correct index (i.e. nums[i] == i)?' },
            { label: 'Swap', description: 'If not, swap it to its correct index.' },
            { label: 'Repeat', description: 'Keep swapping until the current position holds the correct number.' }
        ]
    },
    {
        name: 'pair-sum', title: 'Pair Sum', category: 'Array Patterns',
        explanation: 'Finds a pair of numbers in a sorted array that add up to a specific target sum using two pointers.',
        exampleProblem: { title: 'Two Sum II', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
        steps: [
            { label: 'Initialize Pointers', description: 'Set left pointer at 0 and right pointer at n-1.' },
            { label: 'Calculate Sum', description: 'Check sum = arr[left] + arr[right].' },
            { label: 'Adjust Pointers', description: 'If sum < target, increment left. If sum > target, decrement right. If sum == target, found!' }
        ]
    },
    {
        name: 'rotate-array', title: 'Rotate Array', category: 'Array Patterns',
        explanation: 'Rotates an array to the right by k steps using the triple-reverse optimal approach.',
        exampleProblem: { title: 'Rotate Array', url: 'https://leetcode.com/problems/rotate-array/' },
        steps: [
            { label: 'Reverse All', description: 'Reverse the entire array.' },
            { label: 'Reverse First K', description: 'Reverse the first k elements.' },
            { label: 'Reverse Rest', description: 'Reverse the remaining n-k elements.' }
        ]
    },
    {
        name: 'binary-search', title: 'Binary Search', category: 'Array Patterns',
        explanation: 'Search algorithm that finds the position of a target value within a sorted array by halving the search space.',
        exampleProblem: { title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
        steps: [
            { label: 'Set Bounds', description: 'Set left=0 and right=len-1.' },
            { label: 'Find Mid', description: 'Calculate mid = left + (right-left)/2.' },
            { label: 'Adjust Bounds', description: 'If target < mid, right=mid-1. If target > mid, left=mid+1.' }
        ]
    },
    {
        name: 'hash-map', title: 'Hash Map', category: 'Array Patterns',
        explanation: 'Uses key-value pairs to achieve O(1) average time complexity for lookups and insertions.',
        exampleProblem: { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
        steps: [
            { label: 'Create Map', description: 'Initialize an empty Hash Map object/dictionary.' },
            { label: 'Iterate', description: 'For each element, check if the complement exists in the map.' },
            { label: 'Store & Continue', description: 'If not found, store current value and index in map.' }
        ]
    },
    {
        name: 'hash-set', title: 'Hash Set', category: 'Array Patterns',
        explanation: 'Stores unique elements to allow fast O(1) checks for existence.',
        exampleProblem: { title: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/' },
        steps: [
            { label: 'Initialize Set', description: 'Create an empty Hash Set.' },
            { label: 'Iterate', description: 'For each item, check if it already exists in the set.' },
            { label: 'Detect Duplicates', description: 'If found, return true; else add to set.' }
        ]
    },
    {
        name: 'matrix-traversal', title: 'Matrix Traversal', category: 'Array Patterns',
        explanation: 'Techniques for iterating over 2D grids conceptually mapping to nested loops.',
        exampleProblem: { title: 'Spiral Matrix', url: 'https://leetcode.com/problems/spiral-matrix/' },
        steps: [
            { label: 'Define Boundaries', description: 'Set top, bottom, left, and right bounds.' },
            { label: 'Traverse Layer', description: 'Iterate top row, right col, bottom row, left col.' },
            { label: 'Shrink bounds', description: 'Update boundaries inward and repeat.' }
        ]
    },
    {
        name: 'kadanes-algorithm', title: "Kadane's Algorithm", category: 'Array Patterns',
        explanation: 'Efficiently finds the maximum sum subarray within a one-dimensional array of numbers.',
        exampleProblem: { title: 'Maximum Subarray', url: 'https://leetcode.com/problems/maximum-subarray/' },
        steps: [
            { label: 'Local Max', description: 'current_sum = max(x, current_sum + x)' },
            { label: 'Global Max', description: 'max_sum = max(max_sum, current_sum)' }
        ]
    },
    {
        name: 'merge-intervals', title: 'Merge Intervals', category: 'Array Patterns',
        explanation: 'Dealing with overlapping intervals by merging them into a single interval covering the entire range.',
        exampleProblem: { title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/' },
        steps: [
            { label: 'Sort', description: 'Sort intervals based on their start times.' },
            { label: 'Check Overlap', description: 'If current starts before previous ends, merge.' }
        ]
    },
    {
        name: 'fast-slow-pointers', title: 'Fast & Slow Pointer', category: 'Array Patterns',
        explanation: 'Also known as Floyd\'s Cycle Detection algorithm, useful for linked lists or arrays representing cycles.',
        exampleProblem: { title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' },
        steps: [
            { label: 'Initialize Pointers', description: 'Set slow ptr at head, fast ptr at head.next.' },
            { label: 'Pointers Move', description: 'Slow moves 1 step, fast moves 2 steps.' },
            { label: 'Cycle Check', description: 'If they meet, there is a cycle.' }
        ]
    },
    {
        name: 'linear-search', title: 'Linear Search', category: 'Array Patterns',
        explanation: 'Sequential search through an array until a match is found or the end is reached.',
        exampleProblem: { title: 'Find Target Indices After Sorting Array', url: 'https://leetcode.com/problems/find-target-indices-after-sorting-array/' },
        steps: [
            { label: 'Initialize', description: 'Start from the first element.' },
            { label: 'Check Match', description: 'Compare current element with the target.' },
            { label: 'Next Element', description: 'If no match, move to the next index.' }
        ]
    },
    {
        name: 'stack', title: 'Stack (Push/Pop)', category: 'Advanced Data Structures',
        explanation: 'Last-In, First-Out (LIFO) data structure where elements are added and removed from the same end.',
        exampleProblem: { title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/' },
        steps: [
            { label: 'Push', description: 'Add an element to the top of the stack.' },
            { label: 'Peek', description: 'Look at the top element without removing it.' },
            { label: 'Pop', description: 'Remove the top element from the stack.' }
        ]
    },
    {
        name: 'queue', title: 'Queue (Enqueue/Dequeue)', category: 'Advanced Data Structures',
        explanation: 'First-In, First-Out (FIFO) data structure where elements are added at the back and removed from the front.',
        exampleProblem: { title: 'Number of Recent Calls', url: 'https://leetcode.com/problems/number-of-recent-calls/' },
        steps: [
            { label: 'Enqueue', description: 'Add an element to the rear of the queue.' },
            { label: 'Front', description: 'Access the first element of the queue.' },
            { label: 'Dequeue', description: 'Remove the front element from the queue.' }
        ]
    },

    // --- Sorting Algorithms ---
    {
        name: 'bubble-sort', title: 'Bubble Sort', category: 'Sorting Algorithms',
        explanation: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        exampleProblem: { title: 'Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/' },
        steps: [
            { label: 'Compare Adjacent', description: 'Check if current element is greater than next.' },
            { label: 'Swap', description: 'If true, swap them. Largest element bubbles up to end.' },
            { label: 'Repeat', description: 'Repeat n times for remaining unsorted portion.' }
        ]
    },
    {
        name: 'selection-sort', title: 'Selection Sort', category: 'Sorting Algorithms',
        explanation: 'Sorts an array by repeatedly finding the minimum element from the unsorted part and putting it at the beginning.',
        exampleProblem: { title: 'Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/' },
        steps: [
            { label: 'Find Min', description: 'Iterate through unsorted portion to find the minimum value.' },
            { label: 'Swap with Start', description: 'Swap the minimum value with the first unsorted element.' },
            { label: 'Shrink Unsorted', description: 'Move the boundary of unsorted array one element to the right.' }
        ]
    },
    {
        name: 'insertion-sort', title: 'Insertion Sort', category: 'Sorting Algorithms',
        explanation: 'Builds the final sorted array one item at a time by inserting each element into its proper place.',
        exampleProblem: { title: 'Insertion Sort List', url: 'https://leetcode.com/problems/insertion-sort-list/' },
        steps: [
            { label: 'Pick Element', description: 'Take the next unsorted element.' },
            { label: 'Compare & Shift', description: 'Compare with previous sorted elements, shift them right if larger.' },
            { label: 'Insert', description: 'Place the element in the correct sorted position.' }
        ]
    },
    {
        name: 'merge-sort', title: 'Merge Sort', category: 'Sorting Algorithms',
        explanation: 'Divide and conquer algorithm that divides array into halves, sorts them, and merges them back.',
        exampleProblem: { title: 'Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/' },
        steps: [
            { label: 'Divide', description: 'Recursively split array into left and right halves.' },
            { label: 'Sort Halves', description: 'Recursively sort both smaller components.' },
            { label: 'Merge', description: 'Merge the two sorted halves back into a single ordered array.' }
        ]
    },
    {
        name: 'quick-sort', title: 'Quick Sort', category: 'Sorting Algorithms',
        explanation: 'Selects a \'pivot\' element and partitions the array into two sub-arrays according to whether they are less or greater than the pivot.',
        exampleProblem: { title: 'Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/' },
        steps: [
            { label: 'Choose Pivot', description: 'Select an element (e.g. at the end) to be the pivot.' },
            { label: 'Partition', description: 'Rearrange array so elements < pivot come before it, and > pivot come after.' },
            { label: 'Recursion', description: 'Recursively apply quick sort to left and right partitions.' }
        ]
    },
    {
        name: 'heap-sort', title: 'Heap Sort', category: 'Sorting Algorithms',
        explanation: 'Comparison-based sorting algorithm using a binary heap data structure to find max/min elements.',
        exampleProblem: { title: 'Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/' },
        steps: [
            { label: 'Build Max Heap', description: 'Rearrange array into a valid Max Heap structure.' },
            { label: 'Extract Max', description: 'Swap root (max) with last element and reduce heap size.' },
            { label: 'Heapify', description: 'Fix the heap property at the root to find the next maximum.' }
        ]
    },

    // --- String Algorithms ---
    {
        name: 'frequency-map', title: 'Frequency Map', category: 'String Algorithms',
        explanation: 'Builds a frequency distribution of characters in a string, essential for many string problems.',
        exampleProblem: { title: 'First Unique Character in a String', url: 'https://leetcode.com/problems/first-unique-character-in-a-string/' },
        steps: [
            { label: 'Initialize Map', description: 'Create an empty hash map/object.' },
            { label: 'Scan String', description: 'Iterate through characters one by one.' },
            { label: 'Update Count', description: 'Increment the count for each character in the map.' }
        ]
    },
    {
        name: 'palindrome-expansion', title: 'Palindrome Expansion', category: 'String Algorithms',
        explanation: 'Core logic for finding palindromic substrings by expanding from potential centers.',
        exampleProblem: { title: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
        steps: [
            { label: 'Choose Center', description: 'Pick a character (odd) or gap (even) as center.' },
            { label: 'Expand Pointers', description: 'Move left and right pointers outward while characters match.' },
            { label: 'Mark Bound', description: 'Stop when characters mismatch or bounds are reached.' }
        ]
    },
    {
        name: 'rabin-karp', title: 'Rabin Karp', category: 'String Algorithms',
        explanation: 'String matching algorithm using a rolling hash to quickly filter out invalid matching windows.',
        exampleProblem: { title: 'Implement strStr()', url: 'https://leetcode.com/problems/implement-strstr/' },
        steps: [
            { label: 'Compute Hashes', description: 'Compute hash of target and first window of text.' },
            { label: 'Compare Hashes', description: 'If hashes match, do character-by-character comparison.' },
            { label: 'Roll Window', description: 'Update hash in O(1) time by removing outgoing char and adding incoming char.' }
        ]
    },
    {
        name: 'kmp', title: 'KMP Algorithm', category: 'String Algorithms',
        explanation: 'Knuth-Morris-Pratt string matching algorithm that skips characters based on a failure function (LPS array).',
        exampleProblem: { title: 'Shortest Palindrome', url: 'https://leetcode.com/problems/shortest-palindrome/' },
        steps: [
            { label: 'Build LPS Array', description: 'Precompute Longest Prefix that is also Suffix array.' },
            { label: 'Match Characters', description: 'Iterate text and pattern concurrently.' },
            { label: 'Mismatch Fallback', description: 'On mismatch, use LPS array to skip redundant comparisons.' }
        ]
    },
    {
        name: 'trie', title: 'Trie (Prefix Tree)', category: 'String Algorithms',
        explanation: 'A tree-like data structure used to efficiently store and search strings, especially for prefix matching.',
        exampleProblem: { title: 'Implement Trie (Prefix Tree)', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
        steps: [
            { label: 'Insert', description: 'Traverse/create nodes for each character in the string.' },
            { label: 'Search', description: 'Follow characters through the tree; if all exist and mark end, word is found.' },
            { label: 'Prefix', description: 'Check if a sequence of characters exists as a path.' }
        ]
    },

    // --- Tree Algorithms ---
    {
        name: 'binary-tree-traversal', title: 'Tree Traversals', category: 'Tree Algorithms',
        explanation: 'Techniques to visit all nodes in a binary tree: Preorder, Inorder, and Postorder.',
        exampleProblem: { title: 'Binary Tree Inorder Traversal', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
        steps: [
            { label: 'Pre-order (NLR)', description: 'Visit Node, traverse Left, traverse Right.' },
            { label: 'In-order (LNR)', description: 'Traverse Left, visit Node, traverse Right.' },
            { label: 'Post-order (LRN)', description: 'Traverse Left, traverse Right, visit Node.' }
        ]
    },
    {
        name: 'level-order-traversal', title: 'Level Order Traversal', category: 'Tree Algorithms',
        explanation: 'Visits nodes level by level using a queue, also known as Breadth-First Search on a tree.',
        exampleProblem: { title: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
        steps: [
            { label: 'Enqueue Root', description: 'Add the root node to a queue.' },
            { label: 'Process Level', description: 'Dequeue all nodes at current depth and enqueue their children.' },
            { label: 'Repeat', description: 'Continue until the queue is empty.' }
        ]
    },
    {
        name: 'tree-height', title: 'Tree Height', category: 'Tree Algorithms',
        explanation: 'Calculates the maximum depth of a tree using a recursive bottom-up approach.',
        exampleProblem: { title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
        steps: [
            { label: 'Base Case', description: 'If node is null, height is 0.' },
            { label: 'Recursive Step', description: 'Calculate height of left and right subtrees.' },
            { label: 'Return Max', description: 'Return 1 + max(left_height, right_height).' }
        ]
    },
    {
        name: 'balanced-binary-tree', title: 'Balanced Binary Tree', category: 'Tree Algorithms',
        explanation: 'Checks if a binary tree is height-balanced (difference between depths <= 1).',
        exampleProblem: { title: 'Balanced Binary Tree', url: 'https://leetcode.com/problems/balanced-binary-tree/' },
        steps: [
            { label: 'Check Heights', description: 'Calculate height of left and right subtrees recursively.' },
            { label: 'Verify Balance', description: 'If abs(left - right) > 1, mark as imbalanced.' },
            { label: 'Propagate Result', description: 'Ensure all subtrees are also balanced.' }
        ]
    },

    // --- Graph Algorithms ---
    {
        name: 'bfs', title: 'BFS', category: 'Graph Algorithms',
        explanation: 'Traverses a graph level by level using a Queue, extremely useful for shortest path in unweighted graphs.',
        exampleProblem: { title: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder/' },
        steps: [
            { label: 'Enqueue Root', description: 'Add starting node to queue and mark as visited.' },
            { label: 'Process Layers', description: 'Dequeue node, process it, and enqueue all unvisited neighbors.' },
            { label: 'Repeat', description: 'Continue until the queue is empty.' }
        ]
    },
    {
        name: 'dfs', title: 'DFS', category: 'Graph Algorithms',
        explanation: 'Traverses a graph by exploring as far as possible along each branch before backtracking.',
        exampleProblem: { title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/' },
        steps: [
            { label: 'Push Root', description: 'Start at a node and mark as visited.' },
            { label: 'Dive Deep', description: 'Recursively visit the first unvisited neighbor.' },
            { label: 'Backtrack', description: 'Backtrack to find fresh paths.' }
        ]
    },
    {
        name: 'cycle-detection', title: 'Cycle Detection', category: 'Graph Algorithms',
        explanation: 'Detects if a directed graph contains a cycle using DFS and a recursion stack.',
        exampleProblem: { title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/' },
        steps: [
            { label: 'Visit Node', description: 'Mark node as visited and add to current recursion stack.' },
            { label: 'Check Neighbors', description: 'If neighbor is already in recursion stack, cycle exists!' },
            { label: 'Pop Stack', description: 'Remove node from recursion stack after exploring all paths.' }
        ]
    },
    {
        name: 'dijkstra', title: 'Dijkstra', category: 'Graph Algorithms',
        explanation: "Finds the shortest path between nodes in a graph with non-negative edge weights.",
        exampleProblem: { title: 'Network Delay Time', url: 'https://leetcode.com/problems/network-delay-time/' },
        steps: [
            { label: 'Initialize Distances', description: 'Set distance to start as 0, others as infinity.' },
            { label: 'Priority Queue', description: 'Extract the node with the smallest distance.' },
            { label: 'Relax Edges', description: 'Update neighbor distances if a shorter path is found.' }
        ]
    },
    {
        name: 'bellman-ford', title: 'Bellman Ford', category: 'Graph Algorithms',
        explanation: 'Computes shortest paths from a single source vertex to all of the other vertices in a weighted digraph.',
        exampleProblem: { title: 'Cheapest Flights Within K Stops', url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/' },
        steps: [
            { label: 'Initialization', description: 'Set source distance to 0, all others to infinity.' },
            { label: 'Relax All Edges', description: 'Iterate |V|-1 times, relaxing all edges in the graph.' },
            { label: 'Cycle Check', description: 'Check for negative cycles on the last iteration.' }
        ]
    },
    {
        name: 'floyd-warshall', title: 'Floyd Warshall', category: 'Graph Algorithms',
        explanation: 'All-pairs shortest path algorithm that works by considering each vertex as an intermediate point.',
        exampleProblem: { title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', url: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/' },
        steps: [
            { label: 'Matrix Init', description: 'Create a distance matrix where dist[i][j] is edge weight.' },
            { label: 'Intermediate Node', description: 'For each k, check if dist[i][j] > dist[i][k] + dist[k][j].' },
            { label: 'Update Matrix', description: 'If true, update the matrix with the shorter path.' }
        ]
    },
    {
        name: 'topological-sort', title: 'Topological Sort', category: 'Graph Algorithms',
        explanation: 'Linear ordering of vertices in a DAG such that for every directed edge uv, vertex u comes before v.',
        exampleProblem: { title: 'Course Schedule II', url: 'https://leetcode.com/problems/course-schedule-ii/' },
        steps: [
            { label: 'Indegree', description: 'Calculate the number of incoming edges for each node.' },
            { label: 'Queue', description: 'Add all nodes with 0 indegree to the queue.' },
            { label: 'Process', description: 'Remove node from queue and decrement neighbor indegrees.' }
        ]
    },
    {
        name: 'union-find', title: 'Union Find (Disjoint Set)', category: 'Graph Algorithms',
        explanation: 'Tracks elements partitioned into disjoint sets. Allows near O(1) union and find operations.',
        exampleProblem: { title: 'Number of Provinces', url: 'https://leetcode.com/problems/number-of-provinces/' },
        steps: [
            { label: 'Find', description: 'Determine which set an element belongs to, often with path compression.' },
            { label: 'Union', description: 'Unite two sets into a single set, often by rank or size.' },
            { label: 'Path Compression', description: 'Flatten the tree structure during find operations for efficiency.' }
        ]
    },

    // --- Advanced Data Structures ---
    {
        name: 'segment-tree', title: 'Segment Tree', category: 'Advanced Data Structures',
        explanation: 'A binary tree used for storing information about intervals/segments allowing logarithmic time range queries and updates.',
        exampleProblem: { title: 'Range Sum Query - Mutable', url: 'https://leetcode.com/problems/range-sum-query-mutable/' },
        steps: [
            { label: 'Build Tree', description: 'Recursively combine leaf values (e.g. sum, min, max) towards the root.' },
            { label: 'Update', description: 'Logarithmic update of a leaf value and its parent chain.' },
            { label: 'Range Query', description: 'Efficiently find sum/min/max over a specific range combining relevant disjoint segments.' }
        ]
    },
    {
        name: 'monotonic-stack', title: 'Monotonic Stack', category: 'Advanced Data Structures',
        explanation: 'A stack that maintains elements in a strict increasing or decreasing order. Useful for "next greater" problems.',
        exampleProblem: { title: 'Next Greater Element I', url: 'https://leetcode.com/problems/next-greater-element-i/' },
        steps: [
            { label: 'Push/Pop', description: 'Maintain order by popping elements smaller/larger than the current element.' },
            { label: 'Next Greater', description: 'The top of the stack is the next greater element for the current value.' }
        ]
    },
    {
        name: 'heap-priority-queue', title: 'Heap / Priority Queue', category: 'Advanced Data Structures',
        explanation: 'A specialized tree-based data structure that satisfies the heap property. Used for finding min/max.',
        exampleProblem: { title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
        steps: [
            { label: 'Insert', description: 'Add element to the end and "bubble up" to maintain heap property.' },
            { label: 'Extract Min/Max', description: 'Remove the root and "bubble down" the last element from the root.' }
        ]
    },

    // --- Others ---
    {
        name: 'divide-conquer', title: 'Divide and Conquer', category: 'Recursion',
        explanation: 'Recursively breaks down a problem into two or more sub-problems of the same type, until they become simple enough to be solved directly.',
        exampleProblem: { title: 'Maximum Subarray', url: 'https://leetcode.com/problems/maximum-subarray/' },
        steps: [
            { label: 'Divide', description: 'Break problem into smaller sub-problems.' },
            { label: 'Conquer', description: 'Solve sub-problems recursively.' },
            { label: 'Combine', description: 'Merge the answers to form the final result.' }
        ]
    },
    {
        name: 'dp-grid', title: 'DP Grid Pattern', category: 'Other',
        explanation: 'A common Dynamic Programming technique where a 2D grid is used to store subproblem results.',
        exampleProblem: { title: 'Unique Paths', url: 'https://leetcode.com/problems/unique-paths/' },
        steps: [
            { label: 'Initialization', description: 'Fill the base cases (e.g., first row and first column).' },
            { label: 'Recurrence', description: 'Calculate dp[i][j] based on previously computed neighbors.' }
        ]
    },
    {
        name: 'bit-manipulation', title: 'Bit Manipulation', category: 'Other',
        explanation: 'Operating on data at the bit level using bitwise operators like AND, OR, XOR, and shifts.',
        exampleProblem: { title: 'Single Number', url: 'https://leetcode.com/problems/single-number/' },
        steps: [
            { label: 'XOR Trick', description: 'x ^ x = 0; x ^ 0 = x. Useful for finding unique elements.' },
            { label: 'Bit Shifting', description: 'Move bits left (multiply by 2) or right (divide by 2).' },
            { label: 'Masking', description: 'Use bitwise AND with a mask to extract or set specific bits.' }
        ]
    },
    {
        name: 'greedy', title: 'Greedy Algorithm', category: 'Other',
        explanation: 'Making the locally optimal choice at each step with the hope that these choices lead to a globally optimal solution.',
        exampleProblem: { title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/' },
        steps: [
            { label: 'Local Optimum', description: 'Choose the best option available at the current moment.' },
            { label: 'Greedy Choice', description: 'Assume local optimum will lead to global optimum.' }
        ]
    },
    {
        name: 'recursion-tree', title: 'Recursion Tree', category: 'Recursion',
        explanation: 'Visual representation of recursive calls simulating branch exploration and call stack returns.',
        exampleProblem: { title: 'Fibonacci Number', url: 'https://leetcode.com/problems/fibonacci-number/' },
        steps: [
            { label: 'Base Case Check', description: 'Determine if execution stops here.' },
            { label: 'Recursive Calls', description: 'Branch out to smaller subproblems.' },
            { label: 'Return & Combine', description: 'Bubble results back up the tree to parent nodes.' }
        ]
    },
    {
        name: 'backtracking', title: 'Backtracking', category: 'Recursion',
        explanation: 'Systematically searching for a solution to a problem among all available options by exploring possibilities and undoing choices that lead to dead ends.',
        exampleProblem: { title: 'N-Queens', url: 'https://leetcode.com/problems/n-queens/' },
        steps: [
            { label: 'Place Queen', description: 'Try placing a queen in the current row, column by column.' },
            { label: 'Check Conflicts', description: 'Check if the current position is under attack from previously placed queens.' },
            { label: 'Recurse', description: 'If valid, move to the next row.' },
            { label: 'Backtrack', description: 'If no valid position found or recursion returns, remove the queen and try the next column.' }
        ]
    },
    {
        name: 'include-exclude', title: 'Include / Exclude Pattern', category: 'Recursion',
        explanation: 'A fundamental recursion pattern where for each element, we make two choices: include it in the current subset/path or exclude it.',
        exampleProblem: { title: 'Subsets', url: 'https://leetcode.com/problems/subsets/' },
        steps: [
            { label: 'Decision Point', description: 'At each index, decide whether to include the current element.' },
            { label: 'Include Element', description: 'Add the element to the current subset and recurse for the next index.' },
            { label: 'Exclude Element', description: 'Remove the element (or don\'t add it) and recurse for the next index.' },
            { label: 'Base Case', description: 'When the index reaches the end of the array, a valid subset is formed.' }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');
        
        // Wipe existing DB algorithms to avoid duplicates and ensure cleanly categorized set
        await Algorithm.deleteMany({});
        console.log('Cleared existing algorithms.');

        for (const alg of allAlgorithms) {
            await Algorithm.create(alg);
            console.log(`Seeded: ${alg.title} [${alg.category}]`);
        }

        console.log(`\nSuccessfully seeded ${allAlgorithms.length} algorithms!`);
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
