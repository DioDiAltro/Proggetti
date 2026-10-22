// Fibonacci ricorsivo: ogni chiamata ne fa due, e le chiamate crescono in
// modo esponenziale. fibConta è la stessa funzione con un contatore.
#include <iomanip>      // setw
#include <iostream>
using namespace std;

//@region fib
long long fib(int n) {
    if (n <= 1) return n;                   //@base
    return fib(n - 1) + fib(n - 2);         //@rec
}
//@endregion

long long fibConta(int n, long long& chiamate) {
    chiamate++;
    if (n <= 1) return n;
    return fibConta(n - 1, chiamate) + fibConta(n - 2, chiamate);
}

int main() {
    cout << " n      fib(n)    chiamate\n";
    for (int n : {5, 10, 15, 20, 25, 30}) {
        long long c = 0;
        long long f = fibConta(n, c);
        cout << setw(2) << n << setw(12) << f << setw(12) << c << '\n';
    }
    cout << "fib(10) senza contatore: " << fib(10) << '\n';
    return 0;
}
