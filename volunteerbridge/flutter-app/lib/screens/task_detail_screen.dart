/// Task detail screen showing full need information and accept action.
library;

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';
import '../services/firestore_service.dart';
import '../utils/constants.dart';
import '../widgets/urgency_badge.dart';
import '../widgets/skill_tag.dart';

class TaskDetailScreen extends ConsumerStatefulWidget {
  final String needId;

  const TaskDetailScreen({super.key, required this.needId});

  @override
  ConsumerState<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends ConsumerState<TaskDetailScreen> {
  bool _accepting = false;

  Future<void> _acceptTask() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    setState(() => _accepting = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final success = await apiService.acceptTask(
        widget.needId,
        user.uid,
        defaultOrgId,
      );

      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Task accepted successfully!'),
              backgroundColor: accentTeal,
            ),
          );
          context.go('/tasks');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to accept task. Please try again.'),
              backgroundColor: urgencyHighColor,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: urgencyHighColor,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _accepting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final firestoreService = ref.read(firestoreServiceProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Details'),
      ),
      body: FutureBuilder(
        future: firestoreService.getNeed(widget.needId, defaultOrgId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError || snapshot.data == null) {
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
                    'Task not found',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => context.go('/tasks'),
                    child: const Text('Back to Tasks'),
                  ),
                ],
              ),
            );
          }

          final need = snapshot.data!;
          final isAssigned = need.status != 'unassigned';

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Urgency badge and score
                      Row(
                        children: [
                          UrgencyBadge(urgencyScore: need.urgencyScore),
                          const SizedBox(width: 8),
                          Text(
                            'Urgency: ${need.urgencyScore}/10',
                            style:
                                Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: const Color(0xFF6B7280),
                                    ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Need type as title
                      Text(
                        need.needType,
                        style:
                            Theme.of(context).textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                      ),

                      const SizedBox(height: 20),

                      // Location
                      _buildDetailRow(
                        context,
                        Icons.location_on_outlined,
                        'Location',
                        need.zone,
                      ),

                      const SizedBox(height: 12),

                      // Volunteer hours
                      _buildDetailRow(
                        context,
                        Icons.schedule_outlined,
                        'Volunteer Hours',
                        '${need.volunteerHoursNeeded}h',
                      ),

                      const SizedBox(height: 12),

                      // Status
                      _buildDetailRow(
                        context,
                        Icons.info_outline,
                        'Status',
                        need.status.toUpperCase(),
                      ),

                      const SizedBox(height: 24),

                      // Required skills
                      Text(
                        'Required Skills',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: need.requiredSkills
                            .map((skill) => SkillTag(skill: skill))
                            .toList(),
                      ),

                      if (isAssigned) ...[
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: brandPrimary.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: brandPrimary.withOpacity(0.2),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                Icons.check_circle,
                                color: brandPrimary,
                                size: 24,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'This task has already been assigned.',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      color: brandPrimary,
                                      fontWeight: FontWeight.w600,
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // Accept button
              if (!isAssigned)
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _accepting ? null : _acceptTask,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accentTeal,
                        ),
                        child: _accepting
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : const Text(
                                'Accept Task',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(
    BuildContext context,
    IconData icon,
    String label,
    String value,
  ) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF9CA3AF)),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ],
        ),
      ],
    );
  }
}
