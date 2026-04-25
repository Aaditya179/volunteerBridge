/// Firestore service providing real-time data streams.
library;

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/community_need.dart';
import '../models/volunteer.dart';

/// Provider for the Firestore service.
final firestoreServiceProvider = Provider<FirestoreService>((ref) {
  return FirestoreService();
});

/// Firestore service for real-time data access.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// Stream of community needs ordered by urgency score descending.
  Stream<List<CommunityNeed>> needsStream(String orgId) {
    return _db
        .collection('organizations')
        .doc(orgId)
        .collection('needs')
        .orderBy('urgency_score', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return CommunityNeed.fromJson(data);
      }).toList();
    });
  }

  /// Stream of assignments for a specific volunteer.
  Stream<List<Map<String, dynamic>>> myAssignmentsStream(
    String userId,
    String orgId,
  ) {
    return _db
        .collection('organizations')
        .doc(orgId)
        .collection('assignments')
        .where('volunteer_id', isEqualTo: userId)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return data;
      }).toList();
    });
  }

  /// Stream of a single volunteer document.
  Stream<Volunteer?> volunteerStream(String userId, String orgId) {
    return _db
        .collection('organizations')
        .doc(orgId)
        .collection('volunteers')
        .doc(userId)
        .snapshots()
        .map((doc) {
      if (!doc.exists) return null;
      final data = doc.data()!;
      data['id'] = doc.id;
      return Volunteer.fromJson(data);
    });
  }

  /// Fetch a single need by ID.
  Future<CommunityNeed?> getNeed(String needId, String orgId) async {
    final doc = await _db
        .collection('organizations')
        .doc(orgId)
        .collection('needs')
        .doc(needId)
        .get();

    if (!doc.exists) return null;
    final data = doc.data()!;
    data['id'] = doc.id;
    return CommunityNeed.fromJson(data);
  }

  /// Create or update a volunteer document.
  Future<void> setVolunteer(
    String userId,
    String orgId,
    Map<String, dynamic> data,
  ) async {
    await _db
        .collection('organizations')
        .doc(orgId)
        .collection('volunteers')
        .doc(userId)
        .set(data, SetOptions(merge: true));
  }

  /// Update assignment status.
  Future<void> updateAssignmentStatus(
    String assignmentId,
    String orgId,
    String status,
  ) async {
    await _db
        .collection('organizations')
        .doc(orgId)
        .collection('assignments')
        .doc(assignmentId)
        .update({'status': status});
  }

  /// Check if a volunteer document exists.
  Future<bool> volunteerExists(String userId, String orgId) async {
    final doc = await _db
        .collection('organizations')
        .doc(orgId)
        .collection('volunteers')
        .doc(userId)
        .get();
    return doc.exists;
  }
}
