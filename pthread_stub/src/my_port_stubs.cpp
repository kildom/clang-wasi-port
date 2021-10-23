
#include <malloc.h>
#include <pthread.h>
#include <limits.h>

#define _WASI_EMULATED_MMAN
#include <sys/mman.h>

#define IMPORT(module, name) __attribute__((used)) __attribute__((import_module(#module))) __attribute__((import_name(#name)))
#define IMPORT_MY(name) __attribute__((used)) __attribute__((import_module("wasiext"))) __attribute__((import_name(#name)))

IMPORT_MY(my_realpath)
void my_realpath(const char * filename, char * resolved, int size);

IMPORT_MY(my_fatal)
void my_fatal(const char *message);

IMPORT_MY(my_exec_name)
void my_exec_name(const char *buffer, int size);

IMPORT_MY(my_home_path)
void my_home_path(const char *buffer, int size);

IMPORT_MY(my_exec)
int my_exec(const char* program, const char** args, int arg_count, const char** envs, int env_count, const char** redir);

extern "C" {

char *realpath(const char * filename, char * resolved)
{
    if (resolved == NULL) {
        resolved = (char*)malloc(PATH_MAX + 1);
        if (resolved == NULL) {
            my_fatal("Out of memory");
            return NULL;
        }
    }
    my_realpath(filename, resolved, PATH_MAX);
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

int pthread_mutex_init(pthread_mutex_t *mutex, const pthread_mutexattr_t *mutexattr)
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

int sigemptyset(sigset_t *)
{
    return 0;
}

int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact)
{
    return 0;
}

uid_t getuid(void)
{
    return 1;
}

struct passwd *getpwuid (uid_t)
{
    static struct passwd r;
    static char home[1024] = { 0 };
    if (home[0] == 0) {
        static char user[] = "user";
        static char sh[] = "sh";
        my_home_path(home, sizeof(home));
        r.pw_name = user;
        r.pw_passwd = user;
        r.pw_uid = 1;
        r.pw_gid = 1;
        r.pw_gecos = user;
        r.pw_dir = home;
        r.pw_shell = sh;
    }
    return &r;
}

pid_t getpid(void)
{
    return 1;
}

int pthread_cond_timedwait (pthread_cond_t * cond, pthread_mutex_t * mutex, const struct timespec * abstime)
{
    return 0;
}

static const void *specific[256] = { 0 };
static int specific_count = 1;

void *pthread_getspecific (pthread_key_t __key)
{
    return (void *)specific[*(unsigned char*)&__key];
}

int pthread_setspecific (pthread_key_t __key, const void *__pointer)
{
    specific[*(unsigned char*)&__key] = __pointer;
    return 0;
}

int pthread_equal (pthread_t thread1, pthread_t thread2)
{
    return 1;
}

pthread_t pthread_self (void)
{
    return pthread_t{};
}

int pthread_join (pthread_t __th, void **__thread_return)
{
    if (__thread_return)
        *__thread_return = NULL;
    return 0;
}

int pthread_detach (pthread_t __th)
{
    return 0;
}

int pthread_key_create (pthread_key_t *__key, void (*__destr_function) (void *))
{
    *(unsigned char*)&__key = specific_count++;
    return 0;
}

int pthread_create (pthread_t * newthread, const pthread_attr_t * attr, void *(*start_routine) (void *), void * arg)
{
    my_fatal("Trying to create a thread (pthread_create)!");
    return -1;
}

void *mmap (void *addr, size_t length, int prot, int flags, int fd, off_t offset)
{
    if (addr != NULL) my_fatal("Address unsupported in mmap!");
    if (!(flags & MAP_ANON)) {
        return MAP_FAILED;
    }
    if (length == 0) {
        length = 1;
    }
    return malloc(length);
}

int munmap (void *ptr, size_t)
{
    free(ptr);
    return 0;
}

int mprotect (void *, size_t, int)
{
    return 0;
}

int raise(int sig) {
    my_fatal("Signal raise is unsupported!");
    return -1;
}

}

namespace llvm { namespace sys { namespace fs {
const char* _my_port_GetMainExecutable(void)
{
    static char executable[1024] = { 0 };
    if (executable[0] == 0) {
        my_exec_name(executable, sizeof(executable));
    }
    return executable;
}
}}}

namespace llvm { namespace sys {
int _my_port_exec(const char* program, const char** args, int arg_count, const char** envs, int env_count, const char** redir)
{
    return my_exec(program, args, arg_count, envs, env_count, redir);
}
}}
