import psycopg2
from psycopg2.extras import RealDictCursor
import time
import statistics
import random
import sys

class DatabasePerformanceTester:
    def __init__(self, db_config):
        self.db_config = db_config
        self.conn = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            print("✅ Connected to database successfully!")
            return True
        except psycopg2.Error as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("✅ Database connection closed")
    
    def test_single_query(self, pcb_sr_no, iterations=100):
        """Test performance of a single PCB search"""
        if not self.conn:
            print("❌ No database connection")
            return None
            
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        
        query = "SELECT * FROM manufacturing_data WHERE pcb_sr_no = %s"
        query_times = []
        result_found = False
        
        print(f"\n🔍 Testing PCB Serial Number: {pcb_sr_no}")
        print(f"🔄 Running {iterations} iterations...")
        print("-" * 50)
        
        for i in range(iterations):
            start_time = time.perf_counter()
            
            cursor.execute(query, (pcb_sr_no,))
            result = cursor.fetchone()
            
            end_time = time.perf_counter()
            query_time = (end_time - start_time) * 1000  # Convert to ms
            
            query_times.append(query_time)
            
            if result and not result_found:
                result_found = True
            
            # Show progress every 20 iterations
            if (i + 1) % 20 == 0:
                avg_so_far = sum(query_times) / len(query_times)
                print(f"  Progress: {i+1}/{iterations} | Current avg: {avg_so_far:.3f}ms")
        
        cursor.close()
        
        # Calculate statistics
        if query_times:
            avg_time = statistics.mean(query_times)
            median_time = statistics.median(query_times)
            min_time = min(query_times)
            max_time = max(query_times)
            std_dev = statistics.stdev(query_times) if len(query_times) > 1 else 0
            
            print("\n" + "=" * 60)
            print("📊 PERFORMANCE RESULTS")
            print("=" * 60)
            print(f"🔍 PCB Serial Number: {pcb_sr_no}")
            print(f"✅ Record found: {'Yes' if result_found else 'No'}")
            print(f"🔄 Total iterations: {iterations}")
            print(f"⏱️  Average time: {avg_time:.3f} ms")
            print(f"📈 Median time: {median_time:.3f} ms")
            print(f"🚀 Fastest time: {min_time:.3f} ms")
            print(f"🐌 Slowest time: {max_time:.3f} ms")
            print(f"📊 Std deviation: {std_dev:.3f} ms")
            print(f"⚡ Queries per second: {1000/avg_time:.0f}")
            
            # Performance rating
            if avg_time < 1:
                print(f"🏆 Performance: EXCELLENT (< 1ms)")
            elif avg_time < 5:
                print(f"✅ Performance: GOOD (< 5ms)")
            elif avg_time < 20:
                print(f"⚠️  Performance: OKAY (< 20ms)")
            else:
                print(f"❌ Performance: NEEDS IMPROVEMENT (> 20ms)")
            
            print("=" * 60)
            
            return {
                'pcb_sr_no': pcb_sr_no,
                'iterations': iterations,
                'found': result_found,
                'avg_time_ms': round(avg_time, 3),
                'median_time_ms': round(median_time, 3),
                'min_time_ms': round(min_time, 3),
                'max_time_ms': round(max_time, 3),
                'std_dev_ms': round(std_dev, 3),
                'qps': round(1000/avg_time, 0)
            }
        
        return None
    
    def get_random_pcb_numbers(self, count=10):
        """Get random PCB numbers from database"""
        if not self.conn:
            print("❌ No database connection")
            return []
            
        cursor = self.conn.cursor()
        
        try:
            query = "SELECT pcb_sr_no FROM manufacturing_data ORDER BY RANDOM() LIMIT %s"
            cursor.execute(query, (count,))
            results = cursor.fetchall()
            cursor.close()
            
            pcb_numbers = [row[0] for row in results if row[0]]
            print(f"📋 Retrieved {len(pcb_numbers)} random PCB numbers")
            return pcb_numbers
            
        except psycopg2.Error as e:
            print(f"❌ Error getting PCB numbers: {e}")
            cursor.close()
            return []
    
    def test_multiple_queries(self, pcb_list=None, iterations_per_pcb=50):
        """Test performance with multiple PCB numbers"""
        if not pcb_list:
            pcb_list = self.get_random_pcb_numbers(5)
        
        if not pcb_list:
            print("❌ No PCB numbers to test")
            return
        
        results = []
        total_start_time = time.time()
        
        print(f"\n🚀 MULTI-PCB PERFORMANCE TEST")
        print(f"📋 Testing {len(pcb_list)} PCB numbers")
        print(f"🔄 {iterations_per_pcb} iterations per PCB")
        print("=" * 70)
        
        for i, pcb_no in enumerate(pcb_list, 1):
            print(f"\n[{i}/{len(pcb_list)}] Testing {pcb_no}...")
            result = self.test_single_query(pcb_no, iterations_per_pcb)
            if result:
                results.append(result)
        
        # Overall summary
        if results:
            total_time = time.time() - total_start_time
            avg_times = [r['avg_time_ms'] for r in results]
            overall_avg = statistics.mean(avg_times)
            
            print("\n" + "=" * 70)
            print("🏆 OVERALL SUMMARY")
            print("=" * 70)
            print(f"📊 Total PCBs tested: {len(results)}")
            print(f"⏱️  Total test time: {total_time:.2f} seconds")
            print(f"📈 Overall average query time: {overall_avg:.3f} ms")
            print(f"🚀 Best performance: {min(avg_times):.3f} ms")
            print(f"🐌 Worst performance: {max(avg_times):.3f} ms")
            print("=" * 70)
            
            return results
        
        return []
    
    def check_database_stats(self):
        """Get database statistics"""
        if not self.conn:
            print("❌ No database connection")
            return
            
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            print("\n📊 DATABASE STATISTICS")
            print("=" * 50)
            
            # Total records
            cursor.execute("SELECT COUNT(*) as total FROM manufacturing_data")
            total = cursor.fetchone()['total']
            print(f"📦 Total records: {total:,}")
            
            # Table size
            cursor.execute("""
                SELECT pg_size_pretty(pg_total_relation_size('manufacturing_data')) as size
            """)
            size = cursor.fetchone()['size']
            print(f"💾 Table size: {size}")
            
            # Index information
            cursor.execute("""
                SELECT indexname, indexdef 
                FROM pg_indexes 
                WHERE tablename = 'manufacturing_data'
            """)
            indexes = cursor.fetchall()
            print(f"🔍 Indexes: {len(indexes)}")
            for idx in indexes:
                print(f"  • {idx['indexname']}")
            
            print("=" * 50)
            
        except psycopg2.Error as e:
            print(f"❌ Error getting database stats: {e}")
        finally:
            cursor.close()

def main():
    """Main function to run performance tests"""
    
    # ========== DATABASE CONFIGURATION ==========
    # UPDATE THESE WITH YOUR DATABASE CREDENTIALS
    DB_CONFIG = {
        'host': 'localhost',
        'port': 5432,
        'database': 'Atomberg_Electrolyte',  # CHANGE THIS
        'user': 'postgres',              # CHANGE THIS
        'password': 'Rishbh@16o7'      # CHANGE THIS
    }
    
    print("🚀 DATABASE PERFORMANCE TESTING TOOL")
    print("=" * 70)
    
    # Initialize tester
    tester = DatabasePerformanceTester(DB_CONFIG)
    
    # Connect to database
    if not tester.connect():
        print("❌ Cannot continue without database connection")
        return
    
    try:
        # Show database stats
        tester.check_database_stats()
        
        # Interactive menu
        while True:
            print("\n" + "=" * 50)
            print("🎯 PERFORMANCE TEST OPTIONS")
            print("=" * 50)
            print("1. Test specific PCB Serial Number")
            print("2. Test multiple random PCB numbers")
            print("3. Quick test (5 random PCBs, 20 iterations each)")
            print("4. Stress test (10 random PCBs, 100 iterations each)")
            print("5. Check database statistics")
            print("6. Exit")
            print("=" * 50)
            
            choice = input("Enter your choice (1-6): ").strip()
            
            if choice == '1':
                pcb_no = input("Enter PCB Serial Number: ").strip()
                iterations = int(input("Enter number of iterations (default 100): ") or 100)
                tester.test_single_query(pcb_no, iterations)
                
            elif choice == '2':
                count = int(input("How many PCB numbers to test (default 5): ") or 5)
                iterations = int(input("Iterations per PCB (default 50): ") or 50)
                tester.test_multiple_queries(None, iterations)
                
            elif choice == '3':
                print("\n🚀 Running quick test...")
                tester.test_multiple_queries(None, 20)
                
            elif choice == '4':
                print("\n🔥 Running stress test...")
                tester.test_multiple_queries(None, 100)
                
            elif choice == '5':
                tester.check_database_stats()
                
            elif choice == '6':
                print("👋 Goodbye!")
                break
                
            else:
                print("❌ Invalid choice. Please enter 1-6.")
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
    finally:
        tester.disconnect()

if __name__ == "__main__":
    main()
