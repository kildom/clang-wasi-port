#ifndef _PTHREAD_H_
#define _PTHREAD_H_

#if __cplusplus
extern "C" {
#endif

enum
{
  PTHREAD_MUTEX_NORMAL,
  PTHREAD_MUTEX_RECURSIVE,
};

typedef int pthread_mutex_t;
typedef int pthread_cond_t;
typedef int pthread_t;
typedef int pthread_key_t;
typedef int pthread_mutexattr_t;
typedef int pthread_once_t;
typedef int pthread_attr_t;
typedef int pthread_condattr_t;

#define PTHREAD_COND_INITIALIZER 0
#define PTHREAD_MUTEX_INITIALIZER 0
#define PTHREAD_ONCE_INIT 0

int pthread_cond_init (pthread_cond_t * cond, const pthread_condattr_t * cond_attr);
int pthread_cond_destroy (pthread_cond_t *cond);
int pthread_cond_signal (pthread_cond_t *cond);
int pthread_cond_broadcast (pthread_cond_t *cond);
int pthread_cond_wait (pthread_cond_t * cond, pthread_mutex_t * mutex);
int pthread_cond_timedwait (pthread_cond_t * cond, pthread_mutex_t * mutex, const struct timespec * abstime);
int pthread_cond_clockwait (pthread_cond_t * cond, pthread_mutex_t * mutex, clockid_t clock_id, const struct timespec * abstime);
int pthread_condattr_init (pthread_condattr_t *attr);
int pthread_condattr_destroy (pthread_condattr_t *attr);
int pthread_condattr_getpshared (const pthread_condattr_t *attr, int * pshared);
int pthread_condattr_setpshared (pthread_condattr_t *attr, int pshared);



int pthread_mutex_init (pthread_mutex_t *mutex, const pthread_mutexattr_t *mutexattr);
int pthread_mutex_destroy (pthread_mutex_t *mutex);
int pthread_mutex_trylock (pthread_mutex_t *mutex);
int pthread_mutex_lock (pthread_mutex_t *mutex);
int pthread_mutex_timedlock (pthread_mutex_t * mutex, const struct timespec *abstime);
int pthread_mutex_clocklock (pthread_mutex_t * mutex, clockid_t clockid, const struct timespec *abstime);
int pthread_mutex_unlock (pthread_mutex_t *mutex);
int pthread_mutex_getprioceiling (const pthread_mutex_t *mutex, int * prioceiling);
int pthread_mutex_setprioceiling (pthread_mutex_t * mutex, int prioceiling, int * old_ceiling);
int pthread_mutexattr_init (pthread_mutexattr_t *attr);
int pthread_mutexattr_destroy (pthread_mutexattr_t *attr);
int pthread_mutexattr_getpshared (const pthread_mutexattr_t *attr, int * pshared);
int pthread_mutexattr_setpshared (pthread_mutexattr_t *attr, int pshared);
int pthread_mutexattr_gettype (const pthread_mutexattr_t *attr, int * kind);
int pthread_mutexattr_settype (pthread_mutexattr_t *attr, int kind);
int pthread_mutexattr_getprotocol (const pthread_mutexattr_t *attr, int * protocol);
int pthread_mutexattr_setprotocol (pthread_mutexattr_t *attr, int protocol);
int pthread_mutexattr_getprioceiling (const pthread_mutexattr_t *attr, int * prioceiling);
int pthread_mutexattr_setprioceiling (pthread_mutexattr_t *attr, int prioceiling);
int pthread_mutexattr_getrobust (const pthread_mutexattr_t *attr, int *robustness);
int pthread_mutexattr_getrobust_np (const pthread_mutexattr_t *attr, int *robustness);
int pthread_mutexattr_setrobust (pthread_mutexattr_t *attr, int robustness);
int pthread_mutexattr_setrobust_np (pthread_mutexattr_t *attr, int robustness);

int pthread_once (pthread_once_t *once_control, void (*init_routine) (void));

int pthread_equal (pthread_t thread1, pthread_t thread2);

int pthread_create (pthread_t * newthread, const pthread_attr_t * attr, void *(*start_routine) (void *), void * arg);

int pthread_detach (pthread_t __th);
int pthread_key_create (pthread_key_t *__key, void (*__destr_function) (void *));
void *pthread_getspecific (pthread_key_t __key);
int pthread_setspecific (pthread_key_t __key, const void *__pointer);
extern pthread_t pthread_self (void);
extern int pthread_join (pthread_t __th, void **__thread_return);

#define __DEFINED_pthread_t
#define __DEFINED_pthread_once_t
#define __DEFINED_pthread_key_t
#define __DEFINED_pthread_spinlock_t
#define __DEFINED_pthread_mutexattr_t
#define __DEFINED_pthread_condattr_t
#define __DEFINED_pthread_barrierattr_t
#define __DEFINED_pthread_rwlockattr_t
#define __DEFINED_pthread_attr_t
#define __DEFINED_pthread_mutex_t
#define __DEFINED_pthread_cond_t

#if __cplusplus
};
#endif

#endif _PTHREAD_H_
