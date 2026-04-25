/// Task feed screen showing available community needs.
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../utils/constants.dart';
import '../widgets/task_card.dart';

class TaskFeedScreen extends ConsumerStatefulWidget {
  const TaskFeedScreen({super.key});

  @override
  ConsumerState<TaskFeedScreen> createState() => _TaskFeedScreenState();
}

class _TaskFeedScreenState extends ConsumerState<TaskFeedScreen> {
  bool _isAvailable = true;

  void _toggleAvailability() async {
    final authService = ref.read(authServiceProvider);
    final firestoreService = ref.read(firestoreServiceProvider);
    final user = authService.user;
    if (user == null) return;

    setState(() => _isAvailable = !_isAvailable);

    try {
      await firestoreService.setVolunteer(
        user.uid,
        defaultOrgId,
        {'availability': _isAvailable},
      );
    } catch (e) {
      if (mounted) {
        setState(() => _isAvailable = !_isAvailable);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update availability: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final firestoreService = ref.read(firestoreServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('VolunteerBridge'),
        actions: [
          Row(
            children: [
              Text(
                _isAvailable ? 'Available' : 'Unavailable',
                style: TextStyle(
                  fontSize: 13,
                  color: _isAvailable ? accentTeal : const Color(0xFF9CA3AF),
                  fontWeight: FontWeight.w600,
                ),
              ),
              Switch(
                value: _isAvailable,
                onChanged: (_) => _toggleAvailability(),
                activeColor: accentTeal,
              ),
            ],
          ),
        ],
      ),
      body: StreamBuilder(
        stream: firestoreService.needsStream(defaultOrgId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildShimmerLoading();
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 48,
                    color: urgencyMediumColor,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Failed to load tasks',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${snapshot.error}',
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          final needs = snapshot.data ?? [];
          final availableNeeds =
              needs.where((n) => n.status == 'unassigned').toList();

          if (availableNeeds.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.check_circle_outline,
                    size: 64,
                    color: Colors.grey[300],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No Tasks Available',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: const Color(0xFF6B7280),
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'All current needs have been assigned.\nCheck back soon!',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: const Color(0xFF9CA3AF),
                        ),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              // Stream auto-refreshes, this just gives visual feedback
              await Future.delayed(const Duration(milliseconds: 500));
            },
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: availableNeeds.length,
              itemBuilder: (context, index) {
                return TaskCard(need: availableNeeds[index]);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Shimmer.fromColors(
          baseColor: Colors.grey[200]!,
          highlightColor: Colors.grey[100]!,
          child: Card(
            child: Container(
              height: 140,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 80,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    height: 16,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 200,
                    height: 14,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(7),
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: List.generate(
                      3,
                      (_) => Container(
                        width: 60,
                        height: 24,
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
