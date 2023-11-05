#define Log_n 100

class Funzioni{
    private:
        //Scambio dei numeri per i diversi Sort
        void Change(auto &a, auto &b){
            auto Temp = a;
            a = b;
            b = Temp;

        }

        void Copy(auto V[], auto C[], int x){
            for(int i = 0; i < x; i++){
                    C[i] = V[i];

                }

        }

    public:
        //Ricerca numero minore nel vettore 
        auto Min(const auto V[], int x){
            auto M = V[0];
        
            for(int i = 1; i < x; i++){
                if(V[i] < M){
                    M = V[i];

                }

            }

            return M;

        }

        //Ricerca numero maggiore nel vettore 
        auto Max(const auto V[], int x){
            auto M = V[0];
            
            for(int i = 1; i < x; i++){
                if(V[i] > M){
                    M = V[i];

                }

            }

            return M;

        }
    
        //Ordinamento del vettore in ordine crescente 
        void SortC(auto V[], int x){
            if(x < Log_n){
                for(int i = 0; i < x-1; i++){
                    for(int j = i+1; j < x; j++){
                        if(V[i] > V[j]){
                            Change(V[i], V[j]);

                        }

                    }

                }

            }else{
                
            }

        }       

        //Ordinamento del vettore in ordine decrescente
        void SortD(auto V[], int x){
            if(x < Log_n){
                for(int i = 0; i < x-1; i++){
                    for(int j = i+1; j < x; j++){
                        if(V[j] > V[i]){
                            Change(V[i], V[j]);

                        }

                    }

                }

            }else{

            }
            
        }

        /*Come errore standard la funzione ritornera -1*/
        //Ricerca di un dato nel vettore
        template <typename T>
            int Find(const T V[], int x, auto d){
                if(x < Log_n){
                    for(int i = 0; i < x; i++){
                        if(V[i] == d){
                            return i;
                            
                        }

                    }

                    return -1;

                }else{
                    int left = 0, right = x-1;
                    T *A = new T[x];

                    Copy(V, A, x);

                    SortC(A, x);

                    while(left <= right){
                        int middle = left + (right - left) / 2;

                        if(A[middle] == d){
                            delete[] A;
                            return middle; // Elemento trovato, restituisce l'indice.
                            
                        }else if(A[middle] < d){
                            left = middle + 1;

                        }else{
                            right = middle - 1;

                        }

                    }

                    delete[] A;
                    return -1; // Elemento non trovato.

                }
                
            }

};

Funzioni Funzione;

