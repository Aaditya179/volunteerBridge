/// VolunteerBridge mobile application entry point.
library;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'firebase_options.dart';
import 'screens/login_screen.dart';
import 'screens/my_tasks_screen.dart';
import 'screens/profile_setup_screen.dart';
import 'screens/task_detail_screen.dart';
import 'screens/task_feed_screen.dart';
import 'services/auth_service.dart';
import 'services/notification_service.dart';
import 'utils/theme.dart';

/// Top-level background message handler — must be top-level function.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('Background message received: ${message.messageId}');
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Register background message handler
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(
    const ProviderScope(
      child: VolunteerBridgeApp(),
    ),
  );
}

class VolunteerBridgeApp extends ConsumerWidget {
  const VolunteerBridgeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = _createRouter(ref);

    return MaterialApp.router(
      title: 'VolunteerBridge',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      routerConfig: router,
    );
  }

  GoRouter _createRouter(WidgetRef ref) {
    return GoRouter(
      initialLocation: '/',
      redirect: (context, state) {
        final authService = ref.read(authServiceProvider);
        final isSignedIn = authService.isSignedIn;
        final isOnLogin = state.matchedLocation == '/login';
        final isOnRoot = state.matchedLocation == '/';

        if (!isSignedIn && !isOnLogin) {
          return '/login';
        }

        if (isSignedIn && (isOnLogin || isOnRoot)) {
          return '/tasks';
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/',
          redirect: (context, state) => '/login',
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/profile-setup',
          builder: (context, state) => const ProfileSetupScreen(),
        ),
        ShellRoute(
          builder: (context, state, child) {
            return _MainShell(child: child);
          },
          routes: [
            GoRoute(
              path: '/tasks',
              builder: (context, state) => const TaskFeedScreen(),
            ),
            GoRoute(
              path: '/tasks/:needId',
              builder: (context, state) {
                final needId = state.pathParameters['needId']!;
                return TaskDetailScreen(needId: needId);
              },
            ),
            GoRoute(
              path: '/my-tasks',
              builder: (context, state) => const MyTasksScreen(),
            ),
          ],
        ),
      ],
    );
  }
}

/// Main shell with bottom navigation bar.
class _MainShell extends StatefulWidget {
  final Widget child;

  const _MainShell({required this.child});

  @override
  State<_MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<_MainShell> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          switch (index) {
            case 0:
              context.go('/tasks');
              break;
            case 1:
              context.go('/my-tasks');
              break;
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt_outlined),
            activeIcon: Icon(Icons.list_alt),
            label: 'Tasks',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'My Tasks',
          ),
        ],
      ),
    );
  }
}
