
#include <pthread.h>

char *realpath(const char * filename, char * resolved)
{
    std::strcpy(resolved, filename);
    return resolved;
}

int sigfillset(sigset_t *set)
{
	return 0;
}

int sigprocmask(int how, const sigset_t * set, sigset_t * old)
{
	return 0;
}

int pthread_mutex_init (pthread_mutex_t *mutex, const pthread_mutexattr_t *mutexattr)
{
    return 0;
}

int pthread_mutex_destroy (pthread_mutex_t *mutex)
{
    return 0;
}

int pthread_mutex_trylock (pthread_mutex_t *mutex)
{
    return 0;
}

int pthread_mutex_lock (pthread_mutex_t *mutex)
{
    return 0;
}

int pthread_mutex_unlock (pthread_mutex_t *mutex)
{
    return 0;
}

int pthread_mutexattr_init (pthread_mutexattr_t *attr)
{
    return 0;
}

int pthread_mutexattr_destroy (pthread_mutexattr_t *attr)
{
    return 0;
}

int pthread_mutexattr_settype (pthread_mutexattr_t *attr, int kind)
{
    return 0;
}

int pthread_cond_broadcast (pthread_cond_t *cond)
{
    return 0;
}

int pthread_cond_wait (pthread_cond_t * cond, pthread_mutex_t * mutex)
{
    return 0;
}

int pthread_cond_destroy (pthread_cond_t *cond)
{
    return 0;
}

int pthread_cond_signal (pthread_cond_t *cond)
{
    return 0;
}

unsigned alarm(unsigned)
{
    return 0;
}

int dup2(int oldfd, int newfd)
{
    return newfd;
}

int execve(const char *pathname, char *const argv[], char *const envp[])
{
    return -1;
}

int execv(const char *pathname, char *const argv[])
{
    return -1;
}

int sigemptyset(sigset_t *)
{
    return 0;
}

int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact)
{
    return 0;
}

pid_t wait4(pid_t pid, int *wstatus, int options, struct rusage *rusage)
{
    return -1;
}

pid_t wait (int *wstatus)
{
    return -1;
}

pid_t fork(void)
{
    return 0;
}

namespace llvm { namespace sys { namespace fs {
const char* __my_GetMainExecutable(void)
{
    return "clang";
}
}}}

int kill(pid_t, int)
{
    return 0;
}

char *strsignal(int)
{
    return "[signal]";
}

uid_t getuid(void)
{
    return 1;
}

struct passwd *getpwuid (uid_t)
{
    return NULL;
}

pid_t getpid(void)
{
    return 1;
}

int pthread_cond_timedwait (pthread_cond_t * cond, pthread_mutex_t * mutex, const struct timespec * abstime)
{
    return 0;
}
void *pthread_getspecific (pthread_key_t __key)
{
    return NULL;
}
int pthread_setspecific (pthread_key_t __key, const void *__pointer)
{
    return 0;
}
int pthread_equal (pthread_t thread1, pthread_t thread2)
{
    return 0;
}
pthread_t pthread_self (void)
{
    return pthread_t{};
}
int pthread_join (pthread_t __th, void **__thread_return)
{
    return 0;
}
int pthread_detach (pthread_t __th)
{
    return 0;
}
int pthread_key_create (pthread_key_t *__key, void (*__destr_function) (void *))
{
    return 0;
}
int pthread_create (pthread_t * newthread, const pthread_attr_t * attr, void *(*start_routine) (void *), void * arg)
{
    return -1;
}
